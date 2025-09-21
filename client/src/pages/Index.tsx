import React from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { WalletConnect } from "@/components/WalletConnect";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const { isConnected } = useWeb3();

  return (
    <div className="min-h-screen bg-background">
      {!isConnected ? (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-ocean bg-clip-text text-transparent mb-4">
                Blue Carbon MRV
              </h1>
              <p className="text-muted-foreground">
                Monitoring, Reporting & Verification System for Blue Carbon Ecosystems
              </p>
            </div>
            <WalletConnect />
          </div>
        </div>
      ) : (
        <Dashboard />
      )}
    </div>
  );
};

export default Index;
