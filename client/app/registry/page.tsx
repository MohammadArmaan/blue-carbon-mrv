"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Waves,
  MapPin,
  Calendar,
  Award,
  Building2,
  Leaf,
  Globe,
  CheckCircle,
  Clock,
  ExternalLink,
  TreePine,
  Ruler,
  User,
  Coins,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Logo from "@/components/Logo"
import { contractService } from "@/lib/contracts"
import type { PlantationData } from "@/types/contracts"

// Company data structure (for when you implement company contracts)
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

async function fetchTotalSupply(): Promise<string> {
  return contractService.getTotalSupply()
}

// Mock function for companies - replace with real contract call when implemented
async function fetchCompanies(): Promise<CompanyData[]> {
  // This would be replaced with actual contract call
  return []
}

const ITEMS_PER_PAGE = 6

export default function RegistryPage() {
  const [activeTab, setActiveTab] = useState("plantations")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEcosystem, setFilterEcosystem] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const { data: plantations, isLoading: plantationsLoading } = useSWR("plantations", fetchPlantations)
  const { data: companies, isLoading: companiesLoading } = useSWR("companies", fetchCompanies)
  const { data: totalSupply } = useSWR("total-supply", fetchTotalSupply)

  const filteredPlantations = (plantations || []).filter((plantation) => {
    const matchesSearch =
      plantation.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plantation.implementer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plantation.ecosystemType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEcosystem = filterEcosystem === "all" || plantation.ecosystemType.toLowerCase() === filterEcosystem
    const matchesStatus =
      filterStatus === "all" || (filterStatus === "verified" ? plantation.verified : !plantation.verified)
    return matchesSearch && matchesEcosystem && matchesStatus
  })

  const filteredCompanies = (companies || []).filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || (filterStatus === "verified" ? company.verified : !company.verified)
    return matchesSearch && matchesStatus
  })

  // Pagination logic
  const totalPlantations = filteredPlantations.length
  const totalCompanies = filteredCompanies.length
  const totalItems = activeTab === "plantations" ? totalPlantations : totalCompanies
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  
  const paginatedPlantations = filteredPlantations.slice(startIndex, endIndex)
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex)

  // Reset pagination when switching tabs or filters
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const getEcosystemImage = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mangroves': return '/mangrove-forest-aerial-view.jpg'
      case 'seagrass': return '/seagrass-underwater-meadow.jpg'
      case 'saltmarsh': return '/salt-marsh-coastal-wetland.jpg'
      default: return '/mangrove-forest-aerial-view.jpg'
    }
  }

  const getEcosystemBadge = (type: string, verified: boolean) => {
    const baseClasses = "text-xs font-medium px-2 py-1"
    
    switch (type.toLowerCase()) {
      case 'mangroves':
        return (
          <Badge className={`${baseClasses} bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400`}>
            Mangroves
          </Badge>
        )
      case 'seagrass':
        return (
          <Badge className={`${baseClasses} bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400`}>
            Seagrass
          </Badge>
        )
      case 'saltmarsh':
        return (
          <Badge className={`${baseClasses} bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400`}>
            Salt Marsh
          </Badge>
        )
      default:
        return (
          <Badge className={`${baseClasses} bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400`}>
            {type}
          </Badge>
        )
    }
  }

  const totalArea = (plantations || []).reduce((sum, p) => sum + Number(p.area), 0)

  const PaginationControls = ({ totalItems, totalPages, currentPage, onPageChange }: {
    totalItems: number
    totalPages: number
    currentPage: number
    onPageChange: (page: number) => void
  }) => {
    if (totalPages <= 1) return null

    return (
      <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row items-center justify-between mt-8">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 ocean-gradient opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Logo height={30} width={30} />
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                Blue Carbon Registry
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
              Transparent <span className="text-primary">Blockchain</span> Registry
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Explore verified blue carbon plantations and companies participating in our ecosystem. All data is
              immutably stored on the blockchain for complete transparency.
            </p>
          </motion.div>

          {/* Registry Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="ocean-card text-center p-4">
              <div className="text-2xl font-bold text-primary">
                {plantationsLoading ? "..." : (plantations || []).length}
              </div>
              <div className="text-sm text-muted-foreground">Registered Plantations</div>
            </Card>
            <Card className="ocean-card text-center p-4">
              <div className="text-2xl font-bold text-secondary">
                {companiesLoading ? "..." : (companies || []).length}
              </div>
              <div className="text-sm text-muted-foreground">Partner Companies</div>
            </Card>
            <Card className="ocean-card text-center p-4">
              <div className="text-2xl font-bold text-green-600">
                {plantationsLoading ? "..." : totalArea.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">m² Protected</div>
            </Card>
            <Card className="ocean-card text-center p-4">
              <div className="text-2xl font-bold text-cyan-600">
                {totalSupply ? parseFloat(totalSupply).toLocaleString() : "0"}
              </div>
              <div className="text-sm text-muted-foreground">BCC Credits Issued</div>
            </Card>
          </motion.div>
        </div>
      </section>

      <div className="container mt-3 mx-auto px-4 pb-16">
        {/* Tabs and Filters */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <TabsList className="grid w-full lg:w-auto grid-cols-2 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="plantations" className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" />
                Plantations
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Companies
              </TabsTrigger>
            </TabsList>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    handleFilterChange()
                  }}
                  className="pl-10 bg-background/50"
                />
              </div>

              {activeTab === "plantations" && (
                <Select 
                  value={filterEcosystem} 
                  onValueChange={(value) => {
                    setFilterEcosystem(value)
                    handleFilterChange()
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48 bg-background/50">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter ecosystem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ecosystems</SelectItem>
                    <SelectItem value="mangroves">Mangroves</SelectItem>
                    <SelectItem value="seagrass">Seagrass</SelectItem>
                    <SelectItem value="saltmarsh">Salt Marsh</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select 
                value={filterStatus} 
                onValueChange={(value) => {
                  setFilterStatus(value)
                  handleFilterChange()
                }}
              >
                <SelectTrigger className="w-full sm:w-48 bg-background/50">
                  <Award className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>

          {/* Plantations Tab */}
          <TabsContent value="plantations" className="space-y-6">
            <AnimatePresence mode="wait">
              {plantationsLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-16"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
                    <span className="text-muted-foreground">Loading plantations...</span>
                  </div>
                </motion.div>
              ) : filteredPlantations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <TreePine className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm || filterEcosystem !== "all" || filterStatus !== "all" 
                      ? "No plantations found" 
                      : "No plantations registered yet"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterEcosystem !== "all" || filterStatus !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Be the first to register a blue carbon plantation."}
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedPlantations.map((plantation, index) => (
                      <motion.div
                        key={plantation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                      >
                        <Card className="ocean-card overflow-hidden h-full hover:scale-105 transition-all duration-300">
                          <div className="relative">
                            <img
                              src={getEcosystemImage(plantation.ecosystemType)}
                              alt={`${plantation.ecosystemType} plantation`}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/mangrove-forest-aerial-view.jpg'
                              }}
                            />
                            
                            <div className="absolute top-4 left-4">
                              <Badge
                                variant={plantation.verified ? "default" : "secondary"}
                                className={
                                  plantation.verified 
                                    ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400" 
                                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400"
                                }
                              >
                                {plantation.verified ? (
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
                            <div className="absolute top-4 right-4">
                              {getEcosystemBadge(plantation.ecosystemType, plantation.verified)}
                            </div>
                            <div className="absolute bottom-4 right-4">
                              <Badge variant="outline" className="bg-white/90 text-foreground border-white/20">
                                #{plantation.id}
                              </Badge>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            
                            {/* Overlay text */}
                            <div className="absolute bottom-4 left-4 text-white">
                              <h3 className="font-semibold text-lg mb-1">
                                {plantation.ecosystemType.charAt(0).toUpperCase() + plantation.ecosystemType.slice(1)} Plantation
                              </h3>
                              <div className="flex items-center gap-1 text-sm opacity-90">
                                <MapPin className="h-3 w-3" />
                                {plantation.location}
                              </div>
                            </div>
                          </div>

                          <CardContent className="p-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(plantation.plantationDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {plantation.implementer.slice(0, 6)}...
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                              <div>
                                <div className="text-muted-foreground">Area</div>
                                <div className="font-semibold text-primary flex items-center gap-1">
                                  <Ruler className="h-3 w-3" />
                                  {Number(plantation.area).toLocaleString()} m²
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Credits</div>
                                <div className="font-semibold text-green-600 flex items-center gap-1">
                                  <Coins className="h-3 w-3" />
                                  {plantation.verified ? contractService.calculateCarbonCreditsForPlantation(plantation) : 0}
                                </div>
                              </div>
                            </div>

                            <Button 
                              variant="outline" 
                              className="w-full bg-transparent"
                              onClick={() => window.open(`https://sepolia.etherscan.io/address/${plantation.implementer}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on Etherscan
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <PaginationControls
                    totalItems={totalPlantations}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            <AnimatePresence mode="wait">
              {companiesLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-16"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
                    <span className="text-muted-foreground">Loading companies...</span>
                  </div>
                </motion.div>
              ) : filteredCompanies.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm || filterStatus !== "all" 
                      ? "No companies found" 
                      : "No companies registered yet"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Be the first to register your company."}
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedCompanies.map((company, index) => (
                      <motion.div
                        key={company.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                      >
                        <Card className="ocean-card h-full hover:scale-105 transition-all duration-300">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                                  <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{company.name}</CardTitle>
                                  <div className="text-sm text-muted-foreground capitalize">{company.industry}</div>
                                </div>
                              </div>
                              <Badge variant={company.verified ? "default" : "secondary"}>
                                {company.verified ? (
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

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {company.address}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(company.registrationDate).getFullYear()}
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-4 text-pretty">{company.description}</p>

                            <div className="border-t pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <div className="text-sm text-muted-foreground">Wallet Address</div>
                                  <div className="text-sm font-mono">{company.owner.slice(0, 8)}...{company.owner.slice(-6)}</div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  className="flex-1 bg-transparent"
                                  onClick={() => window.open(`https://sepolia.etherscan.io/address/${company.owner}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Etherscan
                                </Button>
                                {company.website && (
                                  <Button 
                                    variant="outline" 
                                    className="flex-1 bg-transparent"
                                    onClick={() => window.open(company.website, '_blank')}
                                  >
                                    <Globe className="h-4 w-4 mr-2" />
                                    Website
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <PaginationControls
                    totalItems={totalCompanies}
                    totalPages={Math.ceil(totalCompanies / ITEMS_PER_PAGE)}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}