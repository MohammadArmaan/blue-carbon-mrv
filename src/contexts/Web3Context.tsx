import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { web3Service } from "@/lib/web3";
import { contractService } from "@/lib/contracts";

interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  carbonCreditBalance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  events: any[];
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState("0");
  const [carbonCreditBalance, setCarbonCreditBalance] = useState("0");
  const [events, setEvents] = useState<any[]>([]);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const address = await web3Service.connectWallet();
      if (address) {
        setAccount(address);
        setIsConnected(true);
        await updateBalances(address);
        setupEventListeners();
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setBalance("0");
    setCarbonCreditBalance("0");
    setEvents([]);
  };

  const updateBalances = async (address: string) => {
    try {
      const [ethBalance, creditBalance] = await Promise.all([
        web3Service.getBalance(address),
        contractService.getCarbonCreditBalance(address),
      ]);
      setBalance(ethBalance);
      setCarbonCreditBalance(creditBalance);
    } catch (error) {
      console.error("Failed to update balances:", error);
    }
  };

  const setupEventListeners = () => {
    contractService.listenToEvents((event) => {
      setEvents((prev) => [event, ...prev.slice(0, 9)]); // Keep last 10 events
    });
  };

  // Check if wallet is already connected on load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            const provider = web3Service.getProvider();
            if (provider) {
              const signer = await provider.getSigner();
              const address = await signer.getAddress();
              setAccount(address);
              setIsConnected(true);
              await updateBalances(address);
              setupEventListeners();
            }
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          updateBalances(accounts[0]);
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  // Periodically update balances
  useEffect(() => {
    if (account && isConnected) {
      const interval = setInterval(() => {
        updateBalances(account);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [account, isConnected]);

  const value: Web3ContextType = {
    account,
    isConnected,
    isConnecting,
    balance,
    carbonCreditBalance,
    connectWallet,
    disconnectWallet,
    events,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};