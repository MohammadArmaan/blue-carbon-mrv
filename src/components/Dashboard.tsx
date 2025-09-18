import React, { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { contractService } from "@/lib/contracts";
import { WalletConnect } from "./WalletConnect";
import { PlantationForm } from "./PlantationForm";
import { PlantationList } from "./PlantationList";
import { EventsFeed } from "./EventsFeed";
import { VerificationPage } from "@/pages/VerificationPage";
import { MonitoringPage } from "@/pages/MonitoringPage";
import { CarbonCreditsPage } from "@/pages/CarbonCreditsPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TreePine, Coins, Activity, Users, Shield, FileText, ShoppingCart } from "lucide-react";
import heroImage from "@/assets/blue-carbon-hero.jpg";

export const Dashboard = () => {
  const { account, balance, carbonCreditBalance, events } = useWeb3();
  const [activeTab, setActiveTab] = useState("overview");
  const [userPlantations, setUserPlantations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user role for prototype (in real app, this would come from contracts)
  const userRole = "stakeholder"; // "admin", "verifier", "stakeholder", "buyer"

  useEffect(() => {
    loadDashboardData();
  }, [account]);

  const loadDashboardData = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const plantations = await contractService.getUserPlantations(account);
      setUserPlantations(plantations);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onPlantationRegistered = () => {
    loadDashboardData();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img 
          src={heroImage}
          alt="Blue Carbon Ecosystem"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-deep/80 to-ocean-surface/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">Blue Carbon MRV</h1>
            <p className="text-sm md:text-lg opacity-90">
              Monitoring, Reporting & Verification for Blue Carbon Ecosystems
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-6 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card/95 backdrop-blur-sm border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ETH Balance</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{parseFloat(balance).toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">Ethereum</p>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbon Credits</CardTitle>
              <TreePine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {parseFloat(carbonCreditBalance).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">BCC Tokens</p>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{events.length}</div>
              <p className="text-xs text-muted-foreground">Recent activity</p>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-ocean-surface/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ocean-surface">
                <Badge variant="default" className="bg-success">Active</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role-based Navigation */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
                <TabsTrigger value="overview" className="flex items-center gap-2 p-3">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="verification" className="flex items-center gap-2 p-3">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Verification</span>
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="flex items-center gap-2 p-3">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Monitoring</span>
                </TabsTrigger>
                <TabsTrigger value="credits" className="flex items-center gap-2 p-3">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Credits</span>
                </TabsTrigger>
                <TabsTrigger value="plantations" className="flex items-center gap-2 p-3">
                  <TreePine className="h-4 w-4" />
                  <span className="hidden sm:inline">Plantations</span>
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="overview" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <PlantationForm onSuccess={onPlantationRegistered} />
                    </div>
                    <div className="space-y-6">
                      <EventsFeed events={events} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="verification" className="mt-0">
                  <VerificationPage />
                </TabsContent>

                <TabsContent value="monitoring" className="mt-0">
                  <MonitoringPage />
                </TabsContent>

                <TabsContent value="credits" className="mt-0">
                  <CarbonCreditsPage />
                </TabsContent>

                <TabsContent value="plantations" className="mt-0">
                  <PlantationList 
                    plantationIds={userPlantations} 
                    loading={loading}
                    onUpdate={loadDashboardData}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};