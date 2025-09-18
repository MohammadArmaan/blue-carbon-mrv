import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { contractService } from "@/lib/contracts";
import { Loader2, Leaf } from "lucide-react";

interface PlantationFormProps {
  onSuccess: () => void;
}

export const PlantationForm: React.FC<PlantationFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    area: "",
    ecosystemType: "",
    description: "",
  });

  const ecosystemTypes = [
    { value: "mangroves", label: "Mangroves 🌱", color: "mangrove" },
    { value: "seagrass", label: "Seagrass 🌿", color: "seagrass" },
    { value: "saltmarsh", label: "Salt Marsh 🌾", color: "coral" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.location || !formData.area || !formData.ecosystemType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, you'd upload to IPFS here
      const ipfsHash = `QmExample${Date.now()}`;
      
      const tokenId = await contractService.registerPlantation(
        formData.location,
        parseInt(formData.area),
        formData.ecosystemType,
        ipfsHash
      );

      if (tokenId) {
        toast({
          title: "Plantation Registered",
          description: `Successfully registered plantation NFT #${tokenId}`,
        });
        
        // Reset form
        setFormData({
          location: "",
          area: "",
          ecosystemType: "",
          description: "",
        });
        
        onSuccess();
      } else {
        throw new Error("Failed to register plantation");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register plantation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-mangrove" />
          Register New Plantation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Register your blue carbon ecosystem to start monitoring and earning carbon credits.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">GPS Location *</Label>
              <Input
                id="location"
                placeholder="12.9716, 77.5946"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter GPS coordinates (latitude, longitude)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="area">Area (sq meters) *</Label>
              <Input
                id="area"
                type="number"
                placeholder="1000"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ecosystem">Ecosystem Type *</Label>
            <Select
              value={formData.ecosystemType}
              onValueChange={(value) => setFormData({ ...formData, ecosystemType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ecosystem type" />
              </SelectTrigger>
              <SelectContent>
                {ecosystemTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your plantation project..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            variant="ocean"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Registering...
              </>
            ) : (
              "Register Plantation"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};