import React, { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { contractService, PlantationData } from "@/lib/contracts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  TreePine,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const VerificationPage = () => {
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const [pendingPlantations, setPendingPlantations] = useState<PlantationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && account) {
      loadPendingPlantations();
    }
  }, [isConnected, account]);

  const loadPendingPlantations = async () => {
    try {
      setLoading(true);
      const unverifiedPlantations =
        await contractService.getUnverifiedPlantations();
      setPendingPlantations(unverifiedPlantations);
    } catch (error) {
      console.error("Error loading pending plantations:", error);
      toast({
        title: "Error",
        description: "Failed to load pending plantations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPlantation = async (plantationId: string) => {
    try {
      setVerifying(plantationId);
      const creditsAwarded = await contractService.verifyPlantation(plantationId);

      if (creditsAwarded && creditsAwarded > 0) {
        toast({
          title: "Success",
          description: `Plantation verified! ${creditsAwarded} carbon credits awarded to implementer.`,
        });
        await loadPendingPlantations();
      } else {
        toast({
          title: "Error",
          description: "Failed to verify plantation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying plantation:", error);
      toast({
        title: "Error",
        description: "Failed to verify plantation",
        variant: "destructive",
      });
    } finally {
      setVerifying(null);
    }
  };

  const handleRejectPlantation = (plantationId: string) => {
    setPendingPlantations((prev) => prev.filter((p) => p.id !== plantationId));
    toast({
      title: "Plantation Rejected",
      description: "Plantation has been rejected",
    });
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64 px-4 text-center">
        <p className="text-muted-foreground">
          Please connect your wallet to access verification features.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 container px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
          Plantation Verification
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Review and verify submitted plantations
        </p>
      </div>

      {/* Pending Section */}
      <div className="grid gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Clock className="h-5 w-5 text-warning" />
              Pending Verifications ({pendingPlantations.length})
            </CardTitle>
            <CardDescription>
              Plantations awaiting admin approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : pendingPlantations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending plantations to verify
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPlantations.map((plantation) => (
                  <Card
                    key={plantation.id}
                    className="border-l-4 border-l-warning"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Plantation Info */}
                        <div className="space-y-3 w-full lg:w-2/3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                              ID: {plantation.id}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-warning/10 text-warning border-warning"
                            >
                              Pending
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 truncate">
                              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="truncate">{plantation.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TreePine className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span>
                                {plantation.area} m² - {plantation.ecosystemType}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span>
                                {new Date(
                                  plantation.plantationDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground break-words">
                              Implementer:{" "}
                              {plantation.implementer.slice(0, 6)}...
                              {plantation.implementer.slice(-4)}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                          <Button
                            onClick={() => handleVerifyPlantation(plantation.id)}
                            disabled={verifying === plantation.id}
                            className="bg-green-500 hover:bg-green-500/90 w-full sm:w-auto"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {verifying === plantation.id
                              ? "Verifying..."
                              : "Approve"}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleRejectPlantation(plantation.id)}
                            disabled={verifying === plantation.id}
                            className="w-full sm:w-auto"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
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
