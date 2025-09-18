import React, { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { contractService, PlantationData, MonitoringReport } from "@/lib/contracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, TreePine, Calculator, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const MonitoringPage = () => {
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const [userPlantations, setUserPlantations] = useState<PlantationData[]>([]);
  const [reports, setReports] = useState<MonitoringReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedPlantation, setSelectedPlantation] = useState<string>("");
  const [survivalRate, setSurvivalRate] = useState("");
  const [biomass, setBiomass] = useState("");
  const [dataSource, setDataSource] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isConnected && account) {
      loadUserData();
    }
  }, [isConnected, account]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const plantationIds = await contractService.getUserPlantations(account!);
      const plantations: PlantationData[] = [];
      
      for (const id of plantationIds) {
        const plantation = await contractService.getPlantation(id);
        if (plantation) {
          plantations.push(plantation);
        }
      }
      
      setUserPlantations(plantations);
      
      // Mock reports for prototype
      const mockReports: MonitoringReport[] = [
        {
          id: "1",
          plantationId: "1",
          reporter: account!,
          reportDate: new Date().toISOString(),
          survivalRate: "85",
          biomass: "2500",
          carbonSequestered: "750",
          dataSource: "Mobile App",
          ipfsHash: "QmR123...",
          verified: true,
          creditsGenerated: "750"
        }
      ];
      setReports(mockReports);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCarbonSequestration = (plantation: PlantationData, survivalRate: number) => {
    const baseRates = {
      mangroves: 5, // kg CO2 per sq meter per year
      seagrass: 3,
      saltmarsh: 4
    };
    
    const rate = baseRates[plantation.ecosystemType as keyof typeof baseRates] || 3;
    const area = parseInt(plantation.area);
    const carbonSequestered = (rate * area * survivalRate) / 100;
    
    return Math.round(carbonSequestered);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlantation || !survivalRate || !biomass || !dataSource) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const plantation = userPlantations.find(p => p.id === selectedPlantation);
      if (!plantation) return;

      const carbonSequestered = calculateCarbonSequestration(plantation, parseInt(survivalRate));
      
      // Mock submission for prototype
      const newReport: MonitoringReport = {
        id: (reports.length + 1).toString(),
        plantationId: selectedPlantation,
        reporter: account!,
        reportDate: new Date().toISOString(),
        survivalRate,
        biomass,
        carbonSequestered: carbonSequestered.toString(),
        dataSource,
        ipfsHash: `QmHash${Date.now()}`,
        verified: false,
        creditsGenerated: "0"
      };
      
      setReports(prev => [newReport, ...prev]);
      
      // Reset form
      setSelectedPlantation("");
      setSurvivalRate("");
      setBiomass("");
      setDataSource("");
      setNotes("");
      
      toast({
        title: "Success",
        description: "Monitoring report submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit monitoring report",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please connect your wallet to access monitoring features.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
          Monitoring & Reporting
        </h1>
        <p className="text-muted-foreground">Submit monitoring reports for your plantations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Report Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Submit New Report
            </CardTitle>
            <CardDescription>
              Record monitoring data for your plantations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <Label htmlFor="plantation">Plantation *</Label>
                <Select value={selectedPlantation} onValueChange={setSelectedPlantation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plantation" />
                  </SelectTrigger>
                  <SelectContent>
                    {userPlantations.map((plantation) => (
                      <SelectItem key={plantation.id} value={plantation.id}>
                        {plantation.location} - {plantation.ecosystemType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="survivalRate">Survival Rate (%) *</Label>
                <Input
                  id="survivalRate"
                  type="number"
                  min="0"
                  max="100"
                  value={survivalRate}
                  onChange={(e) => setSurvivalRate(e.target.value)}
                  placeholder="Enter survival rate"
                />
              </div>

              <div>
                <Label htmlFor="biomass">Biomass (kg) *</Label>
                <Input
                  id="biomass"
                  type="number"
                  min="0"
                  value={biomass}
                  onChange={(e) => setBiomass(e.target.value)}
                  placeholder="Enter biomass measurement"
                />
              </div>

              <div>
                <Label htmlFor="dataSource">Data Source *</Label>
                <Select value={dataSource} onValueChange={setDataSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mobile App">Mobile App</SelectItem>
                    <SelectItem value="Drone Survey">Drone Survey</SelectItem>
                    <SelectItem value="Manual Survey">Manual Survey</SelectItem>
                    <SelectItem value="Satellite Data">Satellite Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional observations or notes"
                  rows={3}
                />
              </div>

              {selectedPlantation && survivalRate && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    <span className="font-medium">Estimated Carbon Sequestration</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on survival rate: {calculateCarbonSequestration(
                      userPlantations.find(p => p.id === selectedPlantation)!,
                      parseInt(survivalRate)
                    )} kg CO2
                  </p>
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Past Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-success" />
              Your Reports ({reports.length})
            </CardTitle>
            <CardDescription>
              Previously submitted monitoring reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reports submitted yet
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reports.map((report) => (
                  <Card key={report.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">Report #{report.id}</Badge>
                        <Badge variant={report.verified ? "default" : "secondary"}>
                          {report.verified ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Plantation:</span>
                          <p className="font-medium">#{report.plantationId}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Survival Rate:</span>
                          <p className="font-medium">{report.survivalRate}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Carbon Sequestered:</span>
                          <p className="font-medium">{report.carbonSequestered} kg CO2</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Credits Generated:</span>
                          <p className="font-medium">{report.creditsGenerated}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(report.reportDate).toLocaleDateString()} • {report.dataSource}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};