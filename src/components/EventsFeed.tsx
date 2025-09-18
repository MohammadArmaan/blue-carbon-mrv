import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Leaf, Award, Users, ExternalLink } from "lucide-react";
import { web3Service } from "@/lib/web3";

interface Event {
  type: string;
  data: any;
  blockNumber: number;
  transactionHash: string;
}

interface EventsFeedProps {
  events: Event[];
}

export const EventsFeed: React.FC<EventsFeedProps> = ({ events }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "PlantationRegistered":
        return <Leaf className="h-4 w-4 text-green-600" />;
      case "PlantationVerified":
        return <Award className="h-4 w-4 text-blue-600" />;
      case "CarbonCreditsMinted":
        return <Award className="h-4 w-4 text-yellow-600" />;
      case "CarbonCreditsTransferred":
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "PlantationRegistered":
        return "bg-green-50 border-green-200";
      case "PlantationVerified":
        return "bg-blue-50 border-blue-200";
      case "CarbonCreditsMinted":
        return "bg-yellow-50 border-yellow-200";
      case "CarbonCreditsTransferred":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatEventData = (event: Event) => {
    switch (event.type) {
      case "PlantationRegistered":
        return {
          title: "New Plantation Registered",
          description: `Plantation #${event.data.id} registered at ${event.data.location}`,
          details: `By ${web3Service.formatAddress(event.data.implementer)}`,
        };
      case "PlantationVerified":
        return {
          title: "Plantation Verified",
          description: `Plantation #${event.data.id} has been verified`,
          details: `By ${web3Service.formatAddress(event.data.verifier)}`,
        };
      case "CarbonCreditsMinted":
        return {
          title: "Carbon Credits Minted",
          description: `${parseFloat(event.data.amount).toFixed(2)} BCC minted`,
          details: `To ${web3Service.formatAddress(event.data.to)}`,
        };
      case "CarbonCreditsTransferred":
        return {
          title: "Carbon Credits Transferred",
          description: `${parseFloat(event.data.amount).toFixed(2)} BCC transferred`,
          details: `From ${web3Service.formatAddress(event.data.from)} to ${web3Service.formatAddress(event.data.to)}`,
        };
      default:
        return {
          title: event.type,
          description: "Unknown event",
          details: "",
        };
    }
  };

  const getExplorerUrl = (txHash: string) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  return (
    <Card className="shadow-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Events
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Live updates from the blockchain
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No events yet</p>
              <p className="text-sm text-muted-foreground">
                Activity will appear here as it happens
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => {
                const eventData = formatEventData(event);
                return (
                  <Card key={index} className={`border ${getEventColor(event.type)}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium">
                            {eventData.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {eventData.description}
                          </p>
                          {eventData.details && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {eventData.details}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Block #{event.blockNumber}
                            </Badge>
                            <a
                              href={getExplorerUrl(event.transactionHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View TX
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};