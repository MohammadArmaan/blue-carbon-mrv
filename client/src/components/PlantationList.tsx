import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { contractService, PlantationData } from "@/lib/contracts";
import { MapPin, Calendar, CheckCircle, Clock, ExternalLink } from "lucide-react";

interface PlantationListProps {
  plantationIds: string[];
  loading: boolean;
  onUpdate: () => void;
}

export const PlantationList: React.FC<PlantationListProps> = ({
  plantationIds,
  loading,
  onUpdate,
}) => {
  const [plantations, setPlantations] = useState<PlantationData[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadPlantationDetails();
  }, [plantationIds]);

  const loadPlantationDetails = async () => {
    if (plantationIds.length === 0) return;
    
    setLoadingDetails(true);
    try {
      const details = await Promise.all(
        plantationIds.map(id => contractService.getPlantation(id))
      );
      
      setPlantations(details.filter(Boolean) as PlantationData[]);
    } catch (error) {
      console.error("Error loading plantation details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading || loadingDetails) {
    return (
      <Card className="shadow-surface">
        <CardHeader>
          <CardTitle>Plantations Registered</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-surface">
      <CardHeader>
        <CardTitle>Plantations Registered ({plantations.length})</CardTitle>
        {/* <p className="text-sm text-muted-foreground">
          {plantations.length} plantation{plantations.length !== 1 ? 's' : ''} registered
        </p> */}
      </CardHeader>
      <CardContent className="space-y-4">
        {plantations.length === 0 ? (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-gradient-ocean/10 flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Plantations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Register your first blue carbon ecosystem to start earning credits.
            </p>
          </div>
        ) : (
          plantations.map((plantation) => (
            <PlantationCard
              key={plantation.id}
              plantation={plantation}
              onUpdate={onUpdate}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

interface PlantationCardProps {
  plantation: PlantationData;
  onUpdate: () => void;
}

const PlantationCard: React.FC<PlantationCardProps> = ({ plantation, onUpdate }) => {
  const ecosystemIcon = contractService.getEcosystemIcon(plantation.ecosystemType);
  const ecosystemColor = contractService.getEcosystemColor(plantation.ecosystemType);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatArea = (area: string) => {
    const areaNum = parseInt(area);
    if (areaNum >= 10000) {
      return `${(areaNum / 10000).toFixed(1)} hectares`;
    }
    return `${areaNum.toLocaleString()} sq meters`;
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{ecosystemIcon}</span>
            <div>
              <h4 className="font-semibold">Plantation #{plantation.id}</h4>
              <Badge variant="outline" className="capitalize">
                {plantation.ecosystemType}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {plantation.verified ? (
              <Badge className="bg-green-500/10 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{plantation.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(plantation.plantationDate)}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Area: {formatArea(plantation.area)}
            </span>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};