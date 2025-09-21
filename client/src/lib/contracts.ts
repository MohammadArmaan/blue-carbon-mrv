import { ethers } from "ethers";
import { web3Service, CONTRACT_ADDRESSES } from "./web3";

// Import ABI files
import BlueCarbonCreditABI from "../contracts/BlueCarbonCredit.json";
import PlantationRegistryABI from "../contracts/PlantationRegistry.json";
import BlueCarbonMRVABI from "../contracts/BlueCarbonMRV.json";

export interface PlantationData {
  id: string;
  location: string;
  area: string;
  ecosystemType: string;
  plantationDate: string;
  implementer: string;
  verified: boolean;
  ipfsHash: string;
}

export interface MonitoringReport {
  id: string;
  plantationId: string;
  reporter: string;
  reportDate: string;
  survivalRate: string;
  biomass: string;
  carbonSequestered: string;
  dataSource: string;
  ipfsHash: string;
  verified: boolean;
  creditsGenerated: string;
}

export class ContractService {
  private static instance: ContractService;

  static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  private getContract(address: string, abi: any) {
    const signer = web3Service.getSigner();
    if (!signer) throw new Error("No signer available");
    return new ethers.Contract(address, abi.abi, signer);
  }

  // Carbon Credit Token Methods
  async getCarbonCreditBalance(address: string): Promise<string> {
    try {
      const contract = this.getContract(CONTRACT_ADDRESSES.CARBON_CREDIT, BlueCarbonCreditABI);
      const balance = await contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error getting carbon credit balance:", error);
      return "0";
    }
  }

  async transferCarbonCredits(to: string, amount: string): Promise<boolean> {
    try {
      const contract = this.getContract(CONTRACT_ADDRESSES.CARBON_CREDIT, BlueCarbonCreditABI);
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.transfer(to, amountWei);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error transferring carbon credits:", error);
      return false;
    }
  }

  // Plantation Registry Methods
  async registerPlantation(
    location: string,
    area: number,
    ecosystemType: string,
    ipfsHash: string
  ): Promise<string | null> {
    try {
      const contract = this.getContract(CONTRACT_ADDRESSES.PLANTATION_REGISTRY, PlantationRegistryABI);
      const tx = await contract.registerPlantation(location, area, ecosystemType, ipfsHash);
      const receipt = await tx.wait();
      
      // Extract token ID from events
      const event = receipt.logs.find((log: any) => {
        try {
          const decoded = contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          });
          return decoded?.name === "PlantationRegistered";
        } catch {
          return false;
        }
      });
      
      if (event) {
        const decoded = contract.interface.parseLog({
          topics: event.topics as string[],
          data: event.data
        });
        return decoded!.args.id.toString();
      }
      
      return null;
    } catch (error) {
      console.error("Error registering plantation:", error);
      return null;
    }
  }

  async getPlantation(tokenId: string): Promise<PlantationData | null> {
    try {
      const contract = this.getContract(CONTRACT_ADDRESSES.PLANTATION_REGISTRY, PlantationRegistryABI);
      const plantation = await contract.getPlantation(tokenId);
      
      return {
        id: plantation.id.toString(),
        location: plantation.location,
        area: plantation.area.toString(),
        ecosystemType: plantation.ecosystemType,
        plantationDate: new Date(Number(plantation.plantationDate) * 1000).toISOString(),
        implementer: plantation.implementer,
        verified: plantation.verified,
        ipfsHash: plantation.ipfsHash,
      };
    } catch (error) {
      console.error("Error getting plantation:", error);
      return null;
    }
  }

  async getUserPlantations(address: string): Promise<string[]> {
    try {
      const contract = this.getContract(CONTRACT_ADDRESSES.PLANTATION_REGISTRY, PlantationRegistryABI);
      const plantationIds = await contract.getImplementerPlantations(address);
      return plantationIds.map((id: any) => id.toString());
    } catch (error) {
      console.error("Error getting user plantations:", error);
      return [];
    }
  }

  async getAllPlantations(): Promise<PlantationData[]> {
    try {
      const contract = this.getContract(CONTRACT_ADDRESSES.PLANTATION_REGISTRY, PlantationRegistryABI);
      const plantations: PlantationData[] = [];
      
      // Get all plantation registered events
      const filter = contract.filters.PlantationRegistered();
      const events = await contract.queryFilter(filter, 0, 'latest');
      
      for (const event of events) {
        try {
          // Type guard for EventLog
          if ('args' in event && event.args) {
            const tokenId = event.args[0].toString();
            const plantation = await this.getPlantation(tokenId);
            if (plantation) {
              plantations.push(plantation);
            }
          }
        } catch (error) {
          console.error(`Error fetching plantation:`, error);
        }
      }
      
      return plantations;
    } catch (error) {
      console.error("Error getting all plantations:", error);
      return [];
    }
  }

  async getUnverifiedPlantations(): Promise<PlantationData[]> {
    try {
      const allPlantations = await this.getAllPlantations();
      return allPlantations.filter(p => !p.verified);
    } catch (error) {
      console.error("Error getting unverified plantations:", error);
      return [];
    }
  }

  async verifyPlantation(tokenId: string): Promise<number | null> {
    try {
      const contract = this.getContract(CONTRACT_ADDRESSES.PLANTATION_REGISTRY, PlantationRegistryABI);
      const tx = await contract.verifyPlantation(tokenId);
      await tx.wait();
  
      const plantation = await this.getPlantation(tokenId);
      if (plantation) {
        const credits = await this.mintCarbonCreditsForPlantation(plantation);
        return credits; // return minted credits
      }
  
      return null;
    } catch (error) {
      console.error("Error verifying plantation:", error);
      return null;
    }
  }
  

  async mintCarbonCreditsForPlantation(plantation: PlantationData): Promise<boolean> {
    try {
      // Calculate carbon credits based on area and ecosystem type
      const baseCredits = this.calculateCarbonCreditsForPlantation(plantation);
      const contract = this.getContract(CONTRACT_ADDRESSES.CARBON_CREDIT, BlueCarbonCreditABI);
      
      // Mint credits to the implementer
      const amountWei = ethers.parseEther(baseCredits.toString());
      const tx = await contract.mint(plantation.implementer, amountWei);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Error minting carbon credits:", error);
      return false;
    }
  }

  calculateCarbonCreditsForPlantation(plantation: PlantationData): number {
    const area = parseInt(plantation.area);
    const ecosystemType = plantation.ecosystemType.toLowerCase();
    
    // Carbon sequestration rates (kg CO2 per sq meter per year)
    const rates: { [key: string]: number } = {
      mangroves: 5,
      seagrass: 3,
      saltmarsh: 4,
    };
    
    const rate = rates[ecosystemType] || 3; // Default to 3 if unknown
    return Math.floor((area * rate) / 1000); // Convert to credits (1 credit = 1 ton CO2)
  }

  // Event listeners
  async listenToEvents(callback: (event: any) => void) {
    try {
      const provider = web3Service.getProvider();
      if (!provider) return;

      const carbonContract = new ethers.Contract(
        CONTRACT_ADDRESSES.CARBON_CREDIT,
        BlueCarbonCreditABI.abi,
        provider
      );

      const plantationContract = new ethers.Contract(
        CONTRACT_ADDRESSES.PLANTATION_REGISTRY,
        PlantationRegistryABI.abi,
        provider
      );

      // Listen to plantation events
      plantationContract.on("*", (eventName, ...args) => {
        const event = args[args.length - 1]; // Last argument is the event object
        
        if (eventName === "PlantationRegistered") {
          const [id, implementer, location] = args;
          callback({
            type: "PlantationRegistered",
            data: { id: id.toString(), implementer, location },
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          });
        } else if (eventName === "PlantationVerified") {
          const [id, verifier] = args;
          callback({
            type: "PlantationVerified",
            data: { id: id.toString(), verifier },
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          });
        }
      });

      // Listen to carbon credit events
      carbonContract.on("*", (eventName, ...args) => {
        const event = args[args.length - 1];
        
        if (eventName === "Transfer") {
          const [from, to, value] = args;
          if (from === ethers.ZeroAddress) {
            // Minting event
            callback({
              type: "CarbonCreditsMinted",
              data: { to, amount: ethers.formatEther(value) },
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
            });
          } else {
            // Transfer event
            callback({
              type: "CarbonCreditsTransferred",
              data: { from, to, amount: ethers.formatEther(value) },
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
            });
          }
        }
      });

    } catch (error) {
      console.error("Error setting up event listeners:", error);
    }
  }

  // MRV Contract Methods
  async submitMonitoringReport(
    plantationId: string,
    survivalRate: number,
    biomass: number,
    dataSource: string,
    ipfsHash: string
  ): Promise<boolean> {
    try {
      const contract = this.getContract(CONTRACT_ADDRESSES.MRV, BlueCarbonMRVABI);
      const tx = await contract.submitMonitoringReport(
        plantationId,
        survivalRate,
        biomass,
        dataSource,
        ipfsHash
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error submitting monitoring report:", error);
      return false;
    }
  }

  async verifyMonitoringReport(reportId: string): Promise<boolean> {
    try {
      const contract = this.getContract(CONTRACT_ADDRESSES.MRV, BlueCarbonMRVABI);
      const tx = await contract.verifyMonitoringReport(reportId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error verifying monitoring report:", error);
      return false;
    }
  }

  async getMonitoringReport(reportId: string): Promise<MonitoringReport | null> {
    try {
      const contract = this.getContract(CONTRACT_ADDRESSES.MRV, BlueCarbonMRVABI);
      const report = await contract.getMonitoringReport(reportId);
      
      return {
        id: report.id.toString(),
        plantationId: report.plantationId.toString(),
        reporter: report.reporter,
        reportDate: new Date(Number(report.reportDate) * 1000).toISOString(),
        survivalRate: report.survivalRate.toString(),
        biomass: report.biomass.toString(),
        carbonSequestered: report.carbonSequestered.toString(),
        dataSource: report.dataSource,
        ipfsHash: report.ipfsHash,
        verified: report.verified,
        creditsGenerated: report.creditsGenerated.toString(),
      };
    } catch (error) {
      console.error("Error getting monitoring report:", error);
      return null;
    }
  }

  async getTotalSupply(): Promise<string> {
    try {
      const contract = this.getContract(CONTRACT_ADDRESSES.CARBON_CREDIT, BlueCarbonCreditABI);
      const supply = await contract.totalSupply();
      return ethers.formatEther(supply);
    } catch (error) {
      console.error("Error getting total supply:", error);
      return "0";
    }
  }

  // Helper methods
  formatTokenAmount(amount: string): string {
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  getEcosystemIcon(type: string): string {
    switch (type.toLowerCase()) {
      case "mangroves":
        return "🌱";
      case "seagrass":
        return "🌿";
      case "saltmarsh":
        return "🌾";
      default:
        return "🌊";
    }
  }

  getEcosystemColor(type: string): string {
    switch (type.toLowerCase()) {
      case "mangroves":
        return "mangrove";
      case "seagrass":
        return "seagrass";
      case "saltmarsh":
        return "coral";
      default:
        return "ocean.surface";
    }
  }
}

export const contractService = ContractService.getInstance();