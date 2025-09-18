import { ethers } from "ethers";
import { toast } from "@/hooks/use-toast";

// Contract addresses on Sepolia
export const CONTRACT_ADDRESSES = {
  CARBON_CREDIT: "0xf8a2226C8f93c8552ff5DaCB839998C0E846E77c",
  PLANTATION_REGISTRY: "0x32109832c85438f1B4125149B322218bd2EA9CD3",
  // MRV contract address would be added when deployed
  MRV: "0x0000000000000000000000000000000000000000", // Placeholder
};

export const SEPOLIA_RPC_URL = "https://sepolia.infura.io/v3/eae37c3e59e848e79395fee146f0b236";

// Network configuration
export const SEPOLIA_NETWORK = {
  chainId: "0xaa36a7", // 11155111 in hex
  chainName: "Sepolia test network",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [SEPOLIA_RPC_URL],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

export class Web3Service {
  private static instance: Web3Service;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  static getInstance(): Web3Service {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service();
    }
    return Web3Service.instance;
  }

  async connectWallet(): Promise<string | null> {
    try {
      if (!window.ethereum) {
        toast({
          title: "MetaMask not found",
          description: "Please install MetaMask to connect your wallet.",
          variant: "destructive",
        });
        return null;
      }

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      
      // Check if we're on Sepolia
      const network = await this.provider.getNetwork();
      if (network.chainId !== 11155111n) {
        await this.switchToSepolia();
      }

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      return address;
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
      return null;
    }
  }

  async switchToSepolia(): Promise<boolean> {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_NETWORK.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SEPOLIA_NETWORK],
          });
          return true;
        } catch (addError) {
          console.error("Failed to add Sepolia network:", addError);
          return false;
        }
      }
      console.error("Failed to switch to Sepolia:", switchError);
      return false;
    }
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) return "0";
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

// Global Web3 service instance
export const web3Service = Web3Service.getInstance();

// Declare ethereum on window
declare global {
  interface Window {
    ethereum?: any;
  }
}