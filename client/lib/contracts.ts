import { ethers, Contract, type Log, type TransactionReceipt, Interface } from "ethers"
import { web3Service, CONTRACT_ADDRESSES } from "@/lib/web3"
import BlueCarbonCreditABI from "@/lib/abi/BlueCarbonCredit.json"
import PlantationRegistryABI from "@/lib/abi/PlantationRegistry.json"
import BlueCarbonMRVABI from "@/lib/abi/BlueCarbonMRV.json"
import type { PlantationData, MonitoringReport } from "@/types/contracts"

function getContract(address: string, abi: any): Contract {
  const signer = web3Service.getSignerSync()
  if (!signer) throw new Error("No signer available. Please connect wallet.")
  return new Contract(address, abi.abi, signer)
}

class ContractService {
  private static instance: ContractService
  static getInstance() {
    if (!ContractService.instance) ContractService.instance = new ContractService()
    return ContractService.instance
  }

  // ERC20
  async getCarbonCreditBalance(address: string): Promise<string> {
    try {
      const contract = getContract(CONTRACT_ADDRESSES.CARBON_CREDIT, BlueCarbonCreditABI)
      const balance: bigint = await contract.balanceOf(address)
      return ethers.formatEther(balance)
    } catch (e) {
      console.error("getCarbonCreditBalance error:", e)
      return "0"
    }
  }

  async transferCarbonCredits(to: string, amount: string): Promise<boolean> {
    try {
      const contract = getContract(CONTRACT_ADDRESSES.CARBON_CREDIT, BlueCarbonCreditABI)
      const tx = await contract.transfer(to, ethers.parseEther(amount))
      await tx.wait()
      return true
    } catch (e) {
      console.error("transferCarbonCredits error:", e)
      return false
    }
  }

  // Plantation Registry
  async registerPlantation(
    location: string,
    area: number,
    ecosystemType: string,
    ipfsHash: string,
  ): Promise<string | null> {
    try {
      const contract = getContract(CONTRACT_ADDRESSES.PLANTATION_REGISTRY, PlantationRegistryABI)
      const tx = await contract.registerPlantation(location, area, ecosystemType, ipfsHash)
      const receipt: TransactionReceipt = await tx.wait()
      const iface = new Interface(PlantationRegistryABI.abi)
      for (const log of receipt.logs as Log[]) {
        try {
          const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data as string })
          if (parsed?.name === "PlantationRegistered") {
            return parsed.args[0].toString()
          }
        } catch {
          // skip unrelated logs
        }
      }
      return null
    } catch (e) {
      console.error("registerPlantation error:", e)
      return null
    }
  }

  async getPlantation(tokenId: string): Promise<PlantationData | null> {
    try {
      const contract = getContract(CONTRACT_ADDRESSES.PLANTATION_REGISTRY, PlantationRegistryABI)
      const p = await contract.getPlantation(tokenId)
      return {
        id: p.id.toString(),
        location: p.location as string,
        area: p.area.toString(),
        ecosystemType: p.ecosystemType as string,
        plantationDate: new Date(Number(p.plantationDate) * 1000).toISOString(),
        implementer: p.implementer as string,
        verified: Boolean(p.verified),
        ipfsHash: p.ipfsHash as string,
      }
    } catch (e) {
      console.error("getPlantation error:", e)
      return null
    }
  }

  async getAllPlantations(): Promise<PlantationData[]> {
    try {
      // use event logs to enumerate IDs then fetch each
      const signer = await web3Service.ensureSigner()
      const provider = signer.provider
      if (!provider) return []
      const registry = new Contract(CONTRACT_ADDRESSES.PLANTATION_REGISTRY, PlantationRegistryABI.abi, provider)
      const filter = registry.filters.PlantationRegistered()
      const events = await registry.queryFilter(filter, 0, "latest")
      const out: PlantationData[] = []
      for (const ev of events) {
        if ("args" in ev && ev.args) {
          const id = (ev.args as unknown as { [k: number]: unknown })[0] as bigint
          const p = await this.getPlantation(id.toString())
          if (p) out.push(p)
        }
      }
      return out
    } catch (e) {
      console.error("getAllPlantations error:", e)
      return []
    }
  }

  async getUnverifiedPlantations(): Promise<PlantationData[]> {
    const all = await this.getAllPlantations()
    return all.filter((p) => !p.verified)
  }

  async verifyPlantation(tokenId: string): Promise<number | null> {
    try {
      const contract = getContract(CONTRACT_ADDRESSES.PLANTATION_REGISTRY, PlantationRegistryABI)
      const tx = await contract.verifyPlantation(tokenId)
      await tx.wait()
      const plantation = await this.getPlantation(tokenId)
      if (!plantation) return null
      const ok = await this.mintCarbonCreditsForPlantation(plantation)
      return ok ? this.calculateCarbonCreditsForPlantation(plantation) : null
    } catch (e) {
      console.error("verifyPlantation error:", e)
      return null
    }
  }

  async mintCarbonCreditsForPlantation(plantation: PlantationData): Promise<boolean> {
    try {
      const credits = this.calculateCarbonCreditsForPlantation(plantation)
      const contract = getContract(CONTRACT_ADDRESSES.CARBON_CREDIT, BlueCarbonCreditABI)
      const tx = await contract.mint(plantation.implementer, ethers.parseEther(String(credits)))
      await tx.wait()
      return true
    } catch (e) {
      console.error("mintCarbonCreditsForPlantation error:", e)
      return false
    }
  }

  calculateCarbonCreditsForPlantation(p: PlantationData): number {
    const area = Number.parseInt(p.area, 10)
    const rateMap: Record<string, number> = { mangroves: 5, seagrass: 3, saltmarsh: 4 }
    const rate = rateMap[p.ecosystemType.toLowerCase()] ?? 3
    return Math.floor((area * rate) / 1000)
  }

  async submitMonitoringReport(
    plantationId: string,
    survivalRate: number,
    biomass: number,
    dataSource: string,
    ipfsHash: string,
  ): Promise<boolean> {
    try {
      const contract = getContract(CONTRACT_ADDRESSES.MRV, BlueCarbonMRVABI)
      const tx = await contract.submitMonitoringReport(plantationId, survivalRate, biomass, dataSource, ipfsHash)
      await tx.wait()
      return true
    } catch (e) {
      console.error("submitMonitoringReport error:", e)
      return false
    }
  }

  async verifyMonitoringReport(reportId: string): Promise<boolean> {
    try {
      const contract = getContract(CONTRACT_ADDRESSES.MRV, BlueCarbonMRVABI)
      const tx = await contract.verifyMonitoringReport(reportId)
      await tx.wait()
      return true
    } catch (e) {
      console.error("verifyMonitoringReport error:", e)
      return false
    }
  }

  async getMonitoringReport(reportId: string): Promise<MonitoringReport | null> {
    try {
      const contract = getContract(CONTRACT_ADDRESSES.MRV, BlueCarbonMRVABI)
      const r = await contract.getMonitoringReport(reportId)
      return {
        id: r.id.toString(),
        plantationId: r.plantationId.toString(),
        reporter: r.reporter as string,
        reportDate: new Date(Number(r.reportDate) * 1000).toISOString(),
        survivalRate: r.survivalRate.toString(),
        biomass: r.biomass.toString(),
        carbonSequestered: r.carbonSequestered.toString(),
        dataSource: r.dataSource as string,
        ipfsHash: r.ipfsHash as string,
        verified: Boolean(r.verified),
        creditsGenerated: r.creditsGenerated.toString(),
      }
    } catch (e) {
      console.error("getMonitoringReport error:", e)
      return null
    }
  }

  async getTotalSupply(): Promise<string> {
    try {
      const contract = getContract(CONTRACT_ADDRESSES.CARBON_CREDIT, BlueCarbonCreditABI)
      const s: bigint = await contract.totalSupply()
      return ethers.formatEther(s)
    } catch (e) {
      console.error("getTotalSupply error:", e)
      return "0"
    }
  }

  formatTokenAmount(amount: string): string {
    return Number.parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
}

export const contractService = ContractService.getInstance()
