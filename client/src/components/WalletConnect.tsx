import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWeb3 } from "@/contexts/Web3Context";
import { Wallet, LogOut, Coins } from "lucide-react";
import { web3Service } from "@/lib/web3";

export const WalletConnect: React.FC = () => {
  const { account, isConnected, isConnecting, balance, carbonCreditBalance, connectWallet, disconnectWallet } = useWeb3();

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-ocean">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Wallet className="h-12 w-12 mx-auto text-primary mb-2" />
            <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
            <p className="text-muted-foreground text-sm">
              Connect MetaMask to access the Blue Carbon MRV System
            </p>
          </div>
          <Button 
            onClick={connectWallet} 
            disabled={isConnecting}
            variant="ocean"
            className="w-full"
          >
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-surface">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-ocean flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">
                {web3Service.formatAddress(account!)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {parseFloat(balance).toFixed(3)} ETH
                </Badge>
                <Badge variant="outline" className="text-xs bg-seagrass/20">
                  <Coins className="h-3 w-3 mr-1" />
                  {parseFloat(carbonCreditBalance).toFixed(2)} BCC
                </Badge>
              </div>
            </div>
          </div>
          <Button
            onClick={disconnectWallet}
            variant="ghost"
            size="sm"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};