"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { motion } from "framer-motion"
import { contractService } from "@/lib/contracts"
import type { PlantationData } from "@/types/contracts"
import { Waves, TrendingUp, Leaf, DollarSign, MapPin, Calendar, Award, Activity, BarChart3 } from "lucide-react"
import Logo from "@/components/Logo"

export default function DashboardPage() {
  const [totalSupply, setTotalSupply] = useState<string>("0")
  const [plantations, setPlantations] = useState<PlantationData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [supply, plist] = await Promise.all([
          contractService.getTotalSupply(),
          contractService.getAllPlantations(),
        ])
        if (!mounted) return
        setTotalSupply(supply)
        setPlantations(plist)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  // Generate ocean-themed chart data
  const creditsData = Array.from({ length: 12 }).map((_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    credits: Math.max(0, Number(totalSupply) - (11 - i) * (Number(totalSupply) / 12) + Math.random() * 500),
    carbonCaptured: Math.max(
      0,
      (Number(totalSupply) - (11 - i) * (Number(totalSupply) / 12)) * 2.5 + Math.random() * 1000,
    ),
  }))

  const ecosystemData = [
    {
      name: "Mangroves",
      value: plantations.filter((p) => p.ecosystemType.toLowerCase().includes("mangrove")).length,
      color: "hsl(var(--chart-1))",
    },
    {
      name: "Seagrass",
      value: plantations.filter((p) => p.ecosystemType.toLowerCase().includes("seagrass")).length,
      color: "hsl(var(--chart-2))",
    },
    {
      name: "Salt Marsh",
      value: plantations.filter((p) => p.ecosystemType.toLowerCase().includes("salt")).length,
      color: "hsl(var(--chart-3))",
    },
    {
      name: "Kelp Forest",
      value: plantations.filter((p) => p.ecosystemType.toLowerCase().includes("kelp")).length,
      color: "hsl(var(--chart-4))",
    },
  ].filter((item) => item.value > 0)

  const performanceData = Array.from({ length: 7 }).map((_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    efficiency: 75 + Math.random() * 20,
    growth: 60 + Math.random() * 30,
  }))

  const totalCredits = Number(totalSupply)
  const verifiedPlantations = plantations.filter((p) => p.verified).length
  const totalArea = plantations.reduce((sum, p) => sum + Number(p.area), 0)
  const estimatedValue = totalCredits * 0.028 // Average price per credit

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Logo height={40} width={40} className="animate-pulse mb-2 mx-auto" />
          <p className="text-muted-foreground">Loading ocean data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 ocean-gradient opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-4">
              <Logo height={30} width={30} />
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                Ocean Analytics Dashboard
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-balance mb-2">
              Your <span className="text-primary">Blue Carbon</span> Impact
            </h1>
            <p className="text-muted-foreground text-pretty">
              Monitor your plantations, track carbon credits, and analyze ecosystem performance in real-time.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        {/* Key Metrics */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="ocean-card p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{totalCredits.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Credits</div>
              </div>
            </div>
          </Card>

          <Card className="ocean-card p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Award className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">{verifiedPlantations}</div>
                <div className="text-sm text-muted-foreground">Verified Projects</div>
              </div>
            </div>
          </Card>

          <Card className="ocean-card p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{(totalArea / 1000000).toFixed(1)}k</div>
                <div className="text-sm text-muted-foreground">Hectares Protected</div>
              </div>
            </div>
          </Card>

          <Card className="ocean-card p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-600">{estimatedValue.toFixed(1)} ETH</div>
                <div className="text-sm text-muted-foreground">Portfolio Value</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Credits
            </TabsTrigger>
            <TabsTrigger value="ecosystems" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Ecosystems
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Card className="ocean-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Carbon Credits Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={creditsData}>
                          <defs>
                            <linearGradient id="creditsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="credits"
                            stroke="hsl(var(--primary))"
                            fill="url(#creditsGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Card className="ocean-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-secondary" />
                      Carbon Capture Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={creditsData}>
                          <XAxis dataKey="month" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="carbonCaptured"
                            stroke="hsl(var(--secondary))"
                            strokeWidth={3}
                            dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="credits" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card className="ocean-card">
                <CardHeader>
                  <CardTitle>Monthly Credit Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={creditsData}>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="credits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="ecosystems" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Card className="ocean-card">
                  <CardHeader>
                    <CardTitle>Ecosystem Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ecosystemData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {ecosystemData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
                      {ecosystemData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-sm">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Card className="ocean-card">
                  <CardHeader>
                    <CardTitle>Ecosystem Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ecosystemData}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card className="ocean-card">
                <CardHeader>
                  <CardTitle>Weekly Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="efficiency"
                          stackId="1"
                          stroke="hsl(var(--chart-3))"
                          fill="url(#efficiencyGradient)"
                        />
                        <Area
                          type="monotone"
                          dataKey="growth"
                          stackId="2"
                          stroke="hsl(var(--chart-4))"
                          fill="url(#growthGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Recent Plantations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="ocean-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Recent Plantations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plantations.length === 0 ? (
                <div className="text-center py-12">
                  <Waves className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No plantations registered yet.</p>
                  <Button className="mt-4" asChild>
                    <a href="/plantation">Register Your First Plantation</a>
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plantations.slice(0, 6).map((plantation, index) => (
                    <motion.div
                      key={plantation.id}
                      className="ocean-card rounded-lg p-4 hover:scale-105 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-primary">#{plantation.id}</div>
                          <div className="text-sm text-muted-foreground">{plantation.ecosystemType}</div>
                        </div>
                        <Badge variant={plantation.verified ? "default" : "secondary"}>
                          {plantation.verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{plantation.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(Number(plantation.plantationDate) * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Area: </span>
                          <span className="font-medium">{Number(plantation.area).toLocaleString()} m²</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
