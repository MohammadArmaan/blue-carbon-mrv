"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Search, Filter, Waves, MapPin, Calendar, TrendingUp, ShoppingCart } from "lucide-react"
import Logo from "@/components/Logo"

// Mock data for marketplace listings
const mockListings = [
  {
    id: 1,
    plantation: "Mangrove Bay Restoration",
    location: "Philippines",
    ecosystem: "Mangroves",
    credits: 1500,
    pricePerCredit: 0.025,
    totalPrice: 37.5,
    verified: true,
    plantationDate: "2023-03-15",
    area: 25000,
    image: "/mangrove-forest-aerial-view.jpg",
    seller: "0x1234...5678",
    carbonCaptured: 3750,
  },
  {
    id: 2,
    plantation: "Seagrass Meadow Project",
    location: "Australia",
    ecosystem: "Seagrass",
    credits: 800,
    pricePerCredit: 0.032,
    totalPrice: 25.6,
    verified: true,
    plantationDate: "2023-01-20",
    area: 15000,
    image: "/seagrass-underwater-meadow.jpg",
    seller: "0xabcd...efgh",
    carbonCaptured: 2000,
  },
  {
    id: 3,
    plantation: "Salt Marsh Conservation",
    location: "United States",
    ecosystem: "Salt Marsh",
    credits: 2200,
    pricePerCredit: 0.028,
    totalPrice: 61.6,
    verified: true,
    plantationDate: "2022-11-10",
    area: 35000,
    image: "/salt-marsh-coastal-wetland.jpg",
    seller: "0x9876...5432",
    carbonCaptured: 5500,
  },
  {
    id: 4,
    plantation: "Kelp Forest Initiative",
    location: "Norway",
    ecosystem: "Kelp Forest",
    credits: 950,
    pricePerCredit: 0.035,
    totalPrice: 33.25,
    verified: false,
    plantationDate: "2023-06-01",
    area: 18000,
    image: "/underwater-kelp-forest.png",
    seller: "0xdef0...1234",
    carbonCaptured: 2375,
  },
  {
    id: 5,
    plantation: "Coastal Wetland Restoration",
    location: "Brazil",
    ecosystem: "Mangroves",
    credits: 1800,
    pricePerCredit: 0.03,
    totalPrice: 54.0,
    verified: true,
    plantationDate: "2023-02-28",
    area: 42000,
    image: "/coastal-wetland-mangrove-restoration.jpg",
    seller: "0x5678...9abc",
    carbonCaptured: 4500,
  },
  {
    id: 6,
    plantation: "Blue Carbon Sanctuary",
    location: "Indonesia",
    ecosystem: "Mangroves",
    credits: 3000,
    pricePerCredit: 0.027,
    totalPrice: 81.0,
    verified: true,
    plantationDate: "2022-09-15",
    area: 60000,
    image: "/blue-carbon-mangrove-sanctuary.jpg",
    seller: "0xcdef...0123",
    carbonCaptured: 7500,
  },
]

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEcosystem, setFilterEcosystem] = useState("all")
  const [sortBy, setSortBy] = useState("price-low")

  const filteredListings = mockListings
    .filter((listing) => {
      const matchesSearch =
        listing.plantation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesEcosystem = filterEcosystem === "all" || listing.ecosystem.toLowerCase() === filterEcosystem
      return matchesSearch && matchesEcosystem
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.pricePerCredit - b.pricePerCredit
        case "price-high":
          return b.pricePerCredit - a.pricePerCredit
        case "credits-high":
          return b.credits - a.credits
        case "credits-low":
          return a.credits - b.credits
        default:
          return 0
      }
    })

  const totalCredits = filteredListings.reduce((sum, listing) => sum + listing.credits, 0)
  const avgPrice =
    filteredListings.length > 0
      ? filteredListings.reduce((sum, listing) => sum + listing.pricePerCredit, 0) / filteredListings.length
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header Section */}
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
                Carbon Credit Marketplace
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
              Trade Verified <span className="text-primary">Blue Carbon</span> Credits
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover and purchase verified carbon credits from blue carbon ecosystems worldwide. Support ocean
              conservation while offsetting your carbon footprint.
            </p>
          </motion.div>

          {/* Market Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="ocean-card text-center p-4">
              <div className="text-2xl font-bold text-primary">{totalCredits.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Available Credits</div>
            </Card>
            <Card className="ocean-card text-center p-4">
              <div className="text-2xl font-bold text-secondary">{avgPrice.toFixed(3)} ETH</div>
              <div className="text-sm text-muted-foreground">Avg Price</div>
            </Card>
            <Card className="ocean-card text-center p-4">
              <div className="text-2xl font-bold text-green-600">{filteredListings.length}</div>
              <div className="text-sm text-muted-foreground">Active Projects</div>
            </Card>
            <Card className="ocean-card text-center p-4">
              <div className="text-2xl font-bold text-cyan-600">
                {filteredListings.reduce((sum, l) => sum + l.carbonCaptured, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Tons CO₂</div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="container mx-auto px-4 mb-8">
        <motion.div
          className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-sm rounded-xl p-6 border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plantations or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>

            <Select value={filterEcosystem} onValueChange={setFilterEcosystem}>
              <SelectTrigger className="w-full sm:w-48 bg-background/50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by ecosystem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ecosystems</SelectItem>
                <SelectItem value="mangroves">Mangroves</SelectItem>
                <SelectItem value="seagrass">Seagrass</SelectItem>
                <SelectItem value="salt marsh">Salt Marsh</SelectItem>
                <SelectItem value="kelp forest">Kelp Forest</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-background/50">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="credits-high">Credits: High to Low</SelectItem>
                <SelectItem value="credits-low">Credits: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </section>

      {/* Marketplace Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card className="ocean-card overflow-hidden h-full hover:scale-105 transition-all duration-300">
                <div className="relative">
                  <img
                    src={listing.image || "/placeholder.svg"}
                    alt={listing.plantation}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant={listing.verified ? "default" : "secondary"} className="bg-white/90 text-foreground">
                      {listing.verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-white/90 text-foreground border-white/20">
                      {listing.ecosystem}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-balance">{listing.plantation}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(listing.plantationDate).getFullYear()}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Available Credits</div>
                        <div className="font-semibold text-primary">{listing.credits.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Area</div>
                        <div className="font-semibold">{(listing.area / 1000).toFixed(1)}k m²</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">CO₂ Captured</div>
                        <div className="font-semibold text-green-600">{listing.carbonCaptured.toLocaleString()}t</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Price per Credit</div>
                        <div className="font-semibold text-secondary">{listing.pricePerCredit} ETH</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Total Price</div>
                          <div className="text-xl font-bold text-primary">{listing.totalPrice} ETH</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Seller</div>
                          <div className="text-sm font-mono">{listing.seller}</div>
                        </div>
                      </div>

                      <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Credits
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Waves className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No credits found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </motion.div>
        )}
      </section>
    </div>
  )
}
