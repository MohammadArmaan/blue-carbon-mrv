"use client"

import { useState } from "react"
import useSWR from "swr"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { contractService } from "@/lib/contracts"
import { CONTRACT_ADDRESSES } from "@/lib/web3"
import type { PlantationData } from "@/types/contracts"
import { useAccount } from "wagmi"
import { 
  MapPin, 
  Ruler, 
  Calendar, 
  User, 
  ExternalLink, 
  Coins, 
  TreePine, 
  Waves, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Leaf,
  Award,
  Building,
  BookCheckIcon,
  Mail,
  Phone,
  Globe,
  Users,
  FileText
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Schemas
const plantationSchema = z.object({
  location: z.string().min(3, "Location is required"),
  area: z.coerce.number().int().positive("Area must be positive"),
  ecosystemType: z.enum(["mangroves", "seagrass", "saltmarsh"]),
  description: z.string().optional(),
})

const companySchema = z.object({
  name: z.string().min(2, "Company name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  website: z.string().url("Valid website URL is required").optional().or(z.literal("")),
  address: z.string().min(10, "Complete address is required"),
  industry: z.enum(["agriculture", "forestry", "environmental", "consulting", "technology", "other"]),
  description: z.string().min(20, "Description must be at least 20 characters"),
})

// Mock company data structure
interface CompanyData {
  id: string
  name: string
  email: string
  phone: string
  website?: string
  address: string
  industry: string
  description: string
  registrationDate: string
  owner: string
  verified: boolean
}

async function fetchPlantations(): Promise<PlantationData[]> {
  return contractService.getAllPlantations()
}

async function fetchCarbonBalance(address: string): Promise<string> {
  return contractService.getCarbonCreditBalance(address)
}

async function fetchTotalSupply(): Promise<string> {
  return contractService.getTotalSupply()
}

// Mock function for companies - in real implementation, this would call blockchain or API
async function fetchCompanies(): Promise<CompanyData[]> {
  // This would be replaced with actual contract call or API call
  return []
}

export default function RegistrationPage() {
  const { address } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("plantations")
  
  const { data: plantations, isLoading: plantationsLoading, mutate: mutatePlantations } = useSWR("plantations", fetchPlantations)
  const { data: companies, isLoading: companiesLoading, mutate: mutateCompanies } = useSWR("companies", fetchCompanies)
  const { data: carbonBalance } = useSWR(
    address ? `carbon-balance-${address}` : null, 
    () => address ? fetchCarbonBalance(address) : null
  )
  const { data: totalSupply } = useSWR("total-supply", fetchTotalSupply)

  const plantationForm = useForm<z.infer<typeof plantationSchema>>({
    resolver: zodResolver(plantationSchema),
    defaultValues: { location: "", area: 0, ecosystemType: undefined, description: "" } as any,
  })

  const companyForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: { 
      name: "", 
      email: "", 
      phone: "", 
      website: "", 
      address: "", 
      industry: undefined, 
      description: "" 
    } as any,
  })

  const onSubmitPlantation = async (values: z.infer<typeof plantationSchema>) => {
    if (!address) {
      toast.error("Please connect your wallet")
      return
    }

    setIsSubmitting(true)
    try {
      const ipfsHash = `QmDemo${Date.now()}`
      const tokenId = await contractService.registerPlantation(
        values.location,
        values.area,
        values.ecosystemType,
        ipfsHash,
      )
      if (tokenId) {
        toast.success(`Plantation NFT #${tokenId} registered successfully!`)
        await mutatePlantations()
        plantationForm.reset()
      } else {
        toast.error("Failed to register plantation")
      }
    } catch (e: unknown) {
      const err = e as Error
      toast.error(err.message || "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitCompany = async (values: z.infer<typeof companySchema>) => {
    if (!address) {
      toast.error("Please connect your wallet")
      return
    }

    setIsSubmitting(true)
    try {
      // In real implementation, this would call a smart contract function
      // For now, we'll simulate the registration
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      toast.success("Company registered successfully!")
      await mutateCompanies()
      companyForm.reset()
    } catch (e: unknown) {
      const err = e as Error
      toast.error(err.message || "Company registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getEcosystemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mangroves': return <TreePine className="w-4 h-4 text-primary" />
      case 'seagrass': return <Waves className="w-4 h-4 text-primary" />
      case 'saltmarsh': return <Leaf className="w-4 h-4 text-primary" />
      default: return <Leaf className="w-4 h-4" />
    }
  }

  const getIndustryIcon = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'agriculture': return <TreePine className="w-4 h-4 text-primary" />
      case 'forestry': return <Leaf className="w-4 h-4 text-primary" />
      case 'environmental': return <Waves className="w-4 h-4 text-primary" />
      case 'consulting': return <Users className="w-4 h-4 text-primary" />
      case 'technology': return <Building className="w-4 h-4 text-primary" />
      default: return <Building className="w-4 h-4 text-primary" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header Stats Section */}
        <div className="grid grid-cols-1 justify-center md:justify-start md:grid-cols-3 gap-6">
          {/* Carbon Credits Balance */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium text-foreground">
                    My BCC Tokens
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Blue Carbon Credits</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary text-center mt-3">
                {carbonBalance ? parseFloat(carbonBalance).toLocaleString() : "0"} <span className="text-2xl text-muted-foreground">BCC</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Supply */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium text-foreground">
                    Total Supply
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">BCC Tokens Issued</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-5xl text-primary font-bold text-center mt-3">
                {totalSupply ? parseFloat(totalSupply).toLocaleString() : "0"} <span className="text-2xl text-muted-foreground">BCC</span>
              </div>
            </CardContent>
          </Card>

          {/* Contract Addresses */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <BookCheckIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium text-foreground">
                    Smart Contracts
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Deployed Contracts</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <a 
                href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESSES.PLANTATION_REGISTRY}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors group"
              >
                <div>
                  <div className="text-sm font-medium">Registry</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {CONTRACT_ADDRESSES.PLANTATION_REGISTRY?.slice(0, 10)}...{CONTRACT_ADDRESSES.PLANTATION_REGISTRY?.slice(-6)}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </a>
              <a 
                href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESSES.CARBON_CREDIT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors group"
              >
                <div>
                  <div className="text-sm font-medium">Credits</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {CONTRACT_ADDRESSES.CARBON_CREDIT?.slice(0, 10)}...{CONTRACT_ADDRESSES.CARBON_CREDIT?.slice(-6)}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plantations" className="flex items-center gap-2">
              <TreePine className="w-4 h-4" />
              Plantations
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Companies
            </TabsTrigger>
          </TabsList>

          {/* Plantations Tab */}
          <TabsContent value="plantations">
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Plantation Registration Form */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <TreePine className="w-5 h-5 text-primary" />
                    Register Plantation
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Create a new blue carbon plantation NFT
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          GPS Location
                        </Label>
                        <Input 
                          id="location" 
                          placeholder="12.9716, 77.5946" 
                          {...plantationForm.register("location")} 
                        />
                        {plantationForm.formState.errors.location && (
                          <p className="text-red-500 text-sm">{plantationForm.formState.errors.location.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="area" className="flex items-center gap-2">
                          <Ruler className="w-4 h-4 text-muted-foreground" />
                          Area (m²)
                        </Label>
                        <Input 
                          id="area" 
                          type="number" 
                          placeholder="1000" 
                          {...plantationForm.register("area")} 
                        />
                        {plantationForm.formState.errors.area && (
                          <p className="text-red-500 text-sm">{plantationForm.formState.errors.area.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Waves className="w-4 h-4 text-muted-foreground" />
                        Ecosystem Type
                      </Label>
                      <Select onValueChange={(v) => plantationForm.setValue("ecosystemType", v as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ecosystem type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mangroves">
                            <div className="flex items-center gap-2">
                              <TreePine className="w-4 h-4" />
                              Mangroves
                            </div>
                          </SelectItem>
                          <SelectItem value="seagrass">
                            <div className="flex items-center gap-2">
                              <Waves className="w-4 h-4" />
                              Seagrass
                            </div>
                          </SelectItem>
                          <SelectItem value="saltmarsh">
                            <div className="flex items-center gap-2">
                              <Leaf className="w-4 h-4" />
                              Salt Marsh
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {plantationForm.formState.errors.ecosystemType && (
                        <p className="text-red-500 text-sm">{plantationForm.formState.errors.ecosystemType.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="desc">Description (Optional)</Label>
                      <Textarea 
                        id="desc" 
                        rows={10} 
                        placeholder="Project details and additional information..."
                        className="resize-none"
                        {...plantationForm.register("description")} 
                      />
                    </div>
                    
                    <Button 
                      onClick={plantationForm.handleSubmit(onSubmitPlantation)}
                      disabled={isSubmitting || !address}
                      className="w-full"
                    >
                      {isSubmitting && activeTab === "plantations" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
                          Registering...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Register Plantation
                        </div>
                      )}
                    </Button>

                    {!address && (
                      <p className="text-center text-sm text-muted-foreground">
                        Please connect your wallet to register a plantation
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Plantations List */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                        <TreePine className="w-5 h-5 text-primary" />
                        Registered Plantations
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Track all blue carbon plantation projects
                      </p>
                    </div>
                    {plantations && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {plantations.length}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <AnimatePresence mode="wait">
                    {plantationsLoading ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center py-12"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
                          <span className="text-muted-foreground">Loading plantations...</span>
                        </div>
                      </motion.div>
                    ) : !plantations || plantations.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                      >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                          <TreePine className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground text-base font-medium mb-1">
                          No plantations registered yet
                        </p>
                        <p className="text-muted-foreground/70 text-sm">
                          Be the first to register a blue carbon plantation
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4 max-h-[500px] overflow-y-auto"
                      >
                        {plantations.map((plantation, index) => (
                          <motion.div
                            key={plantation.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="border border-border/50 hover:border-primary/30 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                      {getEcosystemIcon(plantation.ecosystemType)}
                                    </div>
                                    <div>
                                      <div className="font-semibold flex items-center gap-2">
                                        #{plantation.id}
                                        <Badge variant="outline" className="text-xs capitalize">
                                          {plantation.ecosystemType}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        Token ID: {plantation.id}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <Badge 
                                    variant={plantation.verified ? "default" : "secondary"}
                                    className={
                                      plantation.verified 
                                        ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400" 
                                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400"
                                    }
                                  >
                                    {plantation.verified ? (
                                      <div className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Verified
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Pending
                                      </div>
                                    )}
                                  </Badge>
                                </div>

                                <Separator className="my-3" />

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-mono text-xs truncate">{plantation.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Ruler className="w-4 h-4 text-muted-foreground" />
                                    <span>{Number(plantation.area).toLocaleString()} m²</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{new Date(plantation.plantationDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-mono text-xs truncate">{plantation.implementer.slice(0, 8)}...</span>
                                  </div>
                                </div>

                                {plantation.verified && (
                                  <div className="mt-3 pt-3 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-muted-foreground">
                                        Carbon Credits Earned
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <Coins className="w-4 h-4 text-primary" />
                                        <span className="font-semibold text-foreground">
                                          {contractService.calculateCarbonCreditsForPlantation(plantation)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies">
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Company Registration Form */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Building className="w-5 h-5 text-primary" />
                    Register Company
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Register your company for blue carbon projects
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        Company Name
                      </Label>
                      <Input 
                        id="companyName" 
                        placeholder="Blue Carbon Solutions Ltd." 
                        {...companyForm.register("name")} 
                      />
                      {companyForm.formState.errors.name && (
                        <p className="text-red-500 text-sm">{companyForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          Email
                        </Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="contact@company.com" 
                          {...companyForm.register("email")} 
                        />
                        {companyForm.formState.errors.email && (
                          <p className="text-red-500 text-sm">{companyForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          Phone
                        </Label>
                        <Input 
                          id="phone" 
                          placeholder="+1 234 567 8900" 
                          {...companyForm.register("phone")} 
                        />
                        {companyForm.formState.errors.phone && (
                          <p className="text-red-500 text-sm">{companyForm.formState.errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        Website (Optional)
                      </Label>
                      <Input 
                        id="website" 
                        placeholder="https://company.com" 
                        {...companyForm.register("website")} 
                      />
                      {companyForm.formState.errors.website && (
                        <p className="text-red-500 text-sm">{companyForm.formState.errors.website.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        Industry
                      </Label>
                      <Select onValueChange={(v) => companyForm.setValue("industry", v as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agriculture">
                            <div className="flex items-center gap-2">
                              <TreePine className="w-4 h-4" />
                              Agriculture
                            </div>
                          </SelectItem>
                          <SelectItem value="forestry">
                            <div className="flex items-center gap-2">
                              <Leaf className="w-4 h-4" />
                              Forestry
                            </div>
                          </SelectItem>
                          <SelectItem value="environmental">
                            <div className="flex items-center gap-2">
                              <Waves className="w-4 h-4" />
                              Environmental Services
                            </div>
                          </SelectItem>
                          <SelectItem value="consulting">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Consulting
                            </div>
                          </SelectItem>
                          <SelectItem value="technology">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              Technology
                            </div>
                          </SelectItem>
                          <SelectItem value="other">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              Other
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {companyForm.formState.errors.industry && (
                        <p className="text-red-500 text-sm">{companyForm.formState.errors.industry.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        Address
                      </Label>
                      <Textarea 
                        id="address" 
                        rows={3} 
                        placeholder="Complete company address..."
                        className="resize-none"
                        {...companyForm.register("address")} 
                      />
                      {companyForm.formState.errors.address && (
                        <p className="text-red-500 text-sm">{companyForm.formState.errors.address.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyDesc">Company Description</Label>
                      <Textarea 
                        id="companyDesc" 
                        rows={6} 
                        placeholder="Describe your company's mission, services, and experience in blue carbon projects..."
                        className="resize-none"
                        {...companyForm.register("description")} 
                      />
                      {companyForm.formState.errors.description && (
                        <p className="text-red-500 text-sm">{companyForm.formState.errors.description.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      onClick={companyForm.handleSubmit(onSubmitCompany)}
                      disabled={isSubmitting || !address}
                      className="w-full"
                    >
                      {isSubmitting && activeTab === "companies" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
                          Registering...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Register Company
                        </div>
                      )}
                    </Button>

                    {!address && (
                      <p className="text-center text-sm text-muted-foreground">
                        Please connect your wallet to register a company
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Companies List */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Building className="w-5 h-5 text-primary" />
                        Registered Companies
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Track all registered blue carbon companies
                      </p>
                    </div>
                    {companies && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {companies.length}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <AnimatePresence mode="wait">
                    {companiesLoading ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center py-12"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
                          <span className="text-muted-foreground">Loading companies...</span>
                        </div>
                      </motion.div>
                    ) : !companies || companies.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                      >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                          <Building className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground text-base font-medium mb-1">
                          No companies registered yet
                        </p>
                        <p className="text-muted-foreground/70 text-sm">
                          Be the first to register your company
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4 max-h-[500px] overflow-y-auto"
                      >
                        {companies.map((company, index) => (
                          <motion.div
                            key={company.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="border border-border/50 hover:border-primary/30 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                      {getIndustryIcon(company.industry)}
                                    </div>
                                    <div>
                                      <div className="font-semibold flex items-center gap-2">
                                        {company.name}
                                        <Badge variant="outline" className="text-xs capitalize">
                                          {company.industry}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        ID: {company.id}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <Badge 
                                    variant={company.verified ? "default" : "secondary"}
                                    className={
                                      company.verified 
                                        ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400" 
                                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400"
                                    }
                                  >
                                    {company.verified ? (
                                      <div className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Verified
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Pending
                                      </div>
                                    )}
                                  </Badge>
                                </div>

                                <Separator className="my-3" />

                                <div className="grid grid-cols-1 gap-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span className="truncate">{company.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span>{company.phone}</span>
                                  </div>
                                  {company.website && (
                                    <div className="flex items-center gap-2">
                                      <Globe className="w-4 h-4 text-muted-foreground" />
                                      <a 
                                        href={company.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline truncate"
                                      >
                                        {company.website}
                                      </a>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{new Date(company.registrationDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <span className="text-xs leading-relaxed">{company.address}</span>
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-border/50">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Description</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {company.description}
                                  </p>
                                </div>

                                <div className="mt-3 pt-3 border-t border-border/50">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-muted-foreground">Owner:</span>
                                    <span className="font-mono text-xs">{company.owner.slice(0, 8)}...{company.owner.slice(-6)}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}