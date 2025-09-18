import React, { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { contractService } from "@/lib/contracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Coins, Send, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreditListing {
  id: string;
  seller: string;
  amount: number;
  pricePerCredit: number;
  totalPrice: number;
}

export const CarbonCreditsPage = () => {
  const { account, isConnected, carbonCreditBalance } = useWeb3();
  const { toast } = useToast();
  const [totalSupply, setTotalSupply] = useState("0");
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  
  // Transfer form state
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  
  // Verified plantations available for listing
  const [verifiedPlantations, setVerifiedPlantations] = useState<any[]>([]);
  
  // Mock marketplace listings (from verified plantations)
  const [listings] = useState<CreditListing[]>([
    {
      id: "1",
      seller: "0x742d35Cc6634C0532925a3b8D45Cc6635C053292",
      amount: 100,
      pricePerCredit: 0.001, // ETH
      totalPrice: 0.1
    },
    {
      id: "2", 
      seller: "0x742d35Cc6634C0532925a3b8D45Cc6635C053293",
      amount: 250,
      pricePerCredit: 0.0008,
      totalPrice: 0.2
    },
    {
      id: "3",
      seller: "0x742d35Cc6634C0532925a3b8D45Cc6635C053294", 
      amount: 500,
      pricePerCredit: 0.0012,
      totalPrice: 0.6
    }
  ]);

  useEffect(() => {
    if (isConnected && account) {
      loadCreditData();
    }
  }, [isConnected, account]);

  const loadCreditData = async () => {
    try {
      setLoading(true);
      const totalSupplyResult = await contractService.getTotalSupply();
      setTotalSupply(totalSupplyResult);
      
      // Load verified plantations that can be listed for credits
      const allPlantations = await contractService.getAllPlantations();
      const verified = allPlantations.filter(p => p.verified);
      setVerifiedPlantations(verified);
    } catch (error) {
      console.error("Error loading credit data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transferTo || !transferAmount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setTransferring(true);
      const success = await contractService.transferCarbonCredits(transferTo, transferAmount);
      
      if (success) {
        toast({
          title: "Success",
          description: `Transferred ${transferAmount} credits successfully`,
        });
        setTransferTo("");
        setTransferAmount("");
      } else {
        toast({
          title: "Error",
          description: "Failed to transfer credits",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error transferring credits:", error);
      toast({
        title: "Error",
        description: "Failed to transfer credits",
        variant: "destructive",
      });
    } finally {
      setTransferring(false);
    }
  };

  const handlePurchaseCredits = async (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    try {
      setPurchasing(listingId);
      
      // Mock purchase for prototype
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: `Purchased ${listing.amount} carbon credits for ${listing.totalPrice} ETH`,
      });
    } catch (error) {
      console.error("Error purchasing credits:", error);
      toast({
        title: "Error",
        description: "Failed to purchase credits",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please connect your wallet to access carbon credits.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
          Carbon Credits
        </h1>
        <p className="text-muted-foreground">Manage and trade your blue carbon credits</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {contractService.formatTokenAmount(carbonCreditBalance)} BCC
            </div>
            <p className="text-xs text-muted-foreground">Blue Carbon Credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {contractService.formatTokenAmount(totalSupply)} BCC
            </div>
            <p className="text-xs text-muted-foreground">Global carbon credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Price</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              0.001 ETH
            </div>
            <p className="text-xs text-muted-foreground">Per credit (avg)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 place-content-center">
        {/* Transfer Credits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Transfer Credits
            </CardTitle>
            <CardDescription>
              Send carbon credits to another address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransferCredits} className="space-y-4">
              <div>
                <Label htmlFor="transferTo">Recipient Address</Label>
                <Input
                  id="transferTo"
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="0x..."
                />
              </div>

              <div>
                <Label htmlFor="transferAmount">Amount (BCC)</Label>
                <Input
                  id="transferAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Available Balance: {contractService.formatTokenAmount(carbonCreditBalance)} BCC
                </p>
              </div>

              <Button type="submit" disabled={transferring} className="w-full">
                {transferring ? "Transferring..." : "Transfer Credits"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Marketplace */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-success" />
              Carbon Credit Marketplace
            </CardTitle>
            <CardDescription>
              Purchase credits from other users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {listings.map((listing) => (
                <Card key={listing.id} className="border-l-4 border-l-success">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Badge variant="secondary">{listing.amount} BCC</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          From: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{listing.totalPrice} ETH</p>
                        <p className="text-sm text-muted-foreground">
                          {listing.pricePerCredit} ETH per credit
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePurchaseCredits(listing.id)}
                      disabled={purchasing === listing.id}
                      className="w-full bg-success hover:bg-success/90"
                    >
                      {purchasing === listing.id ? "Purchasing..." : "Buy Credits"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Recent Transactions */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your carbon credit transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recent transactions
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};