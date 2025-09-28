import { ethers } from "ethers"

export const CONTRACT_ADDRESSES = {
  CARBON_CREDIT: "0xf8a2226C8f93c8552ff5DaCB839998C0E846E77c",
  PLANTATION_REGISTRY: "0x32109832c85438f1B4125149B322218bd2EA9CD3",
  MRV: "0x0000000000000000000000000000000000000000",
} as const

export const CONTRACT_ROLES = {
  OWNER: "0x6fcD6344267F2D7C4D09914437A06ceF3Fc2E304",
  ADMIN: "0x6fcD6344267F2D7C4D09914437A06ceF3Fc2E304",
} as const

export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7" // 11155111
export const SEPOLIA_CHAIN_ID = 11155111

export const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.drpc.org"

export const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: "Sepolia",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: [SEPOLIA_RPC_URL],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
} as const

class Web3Service {
  private static instance: Web3Service
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null

  static getInstance() {
    if (!Web3Service.instance) Web3Service.instance = new Web3Service()
    return Web3Service.instance
  }

  setProviderFromWindow() {
    if (typeof window === "undefined") return
    const eth = (window as any).ethereum
    if (!eth) return
    this.provider = new ethers.BrowserProvider(eth)
  }

  async ensureSigner(): Promise<ethers.Signer> {
    if (!this.provider) this.setProviderFromWindow()
    if (!this.provider) throw new Error("No provider. Connect wallet first.")
    this.signer = await this.provider.getSigner()
    return this.signer
  }

  getProvider() {
    return this.provider
  }

  getSignerSync() {
    return this.signer
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) this.setProviderFromWindow()
    if (!this.provider) return "0"
    const balance = await this.provider.getBalance(address)
    return ethers.formatEther(balance)
  }

  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
}

export const web3Service = Web3Service.getInstance()

declare global {
  interface Window {
    ethereum?: unknown
  }
}
