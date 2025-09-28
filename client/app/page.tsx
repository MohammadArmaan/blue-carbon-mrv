"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Waves, Leaf, Shield, BarChart3, Users, CreditCard } from "lucide-react"
import Logo from "@/components/Logo"

const features = [
  {
    icon: Leaf,
    title: "Register Plantations & Companies",
    description:
      "Submit plantation details and mint NFTs for verified blue carbon projects with blockchain transparency.",
    color: "text-green-600",
  },
  {
    icon: Shield,
    title: "Transparent Blockchain Registry",
    description:
      "Immutable record-keeping with smart contracts ensuring trust and verification of all carbon projects.",
    color: "text-blue-600",
  },
  {
    icon: CreditCard,
    title: "Buy & Sell Carbon Credits",
    description:
      "Trade ERC20 carbon credits in our decentralized marketplace with real-time pricing and instant settlement.",
    color: "text-cyan-600",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics Dashboard",
    description: "Monitor your impact with comprehensive charts, ecosystem tracking, and performance metrics.",
    color: "text-indigo-600",
  },
  {
    icon: Users,
    title: "Secure Admin & Verification System",
    description:
      "Role-based access control with field officers, verifiers, and administrators ensuring project integrity.",
    color: "text-teal-600",
  },
]

export default function Page() {
  return (
    <div className="relative">
      {/* Hero Section with Ocean Gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 ocean-gradient opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 items-center gap-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 mb-4">
                {/* <Waves className="h-8 w-8 text-primary" /> */}
                <Logo height={30} width={30} />
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  Web3 Ocean Conservation
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
                Protect Our <span className="text-primary">Blue Carbon</span> Ecosystems
              </h1>

              <p className="mt-6 text-lg text-muted-foreground text-pretty leading-relaxed">
                The world's first decentralized platform for monitoring, reporting, and verifying blue carbon projects.
                Register mangrove plantations, earn verified carbon credits, and trade in our transparent marketplace.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
                <Button asChild size="lg" className="bg-primary w-full hover:bg-primary/90 font-bold text-white px-8">
                  <Link href="/registration">Register Now</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  size="lg"
                  className="border-primary/30 hover:text-black w-full hover:bg-primary/30 bg-transparent"
                >
                  <Link href="/marketplace">Explore Marketplace</Link>
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Blockchain Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Carbon Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <span>Ocean Positive</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden floating">
                <img
                  src="/blue-carbon-hero.jpg"
                  alt="Blue carbon mangrove ecosystem from aerial view"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
              </div>

              {/* Floating stats cards */}
              <motion.div
                className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <div className="text-2xl font-bold text-primary">2.5M+</div>
                <div className="text-sm text-muted-foreground">Tons CO₂ Captured</div>
              </motion.div>

              <motion.div
                className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.4 }}
              >
                <div className="text-2xl font-bold text-secondary">150+</div>
                <div className="text-sm text-muted-foreground">Active Projects</div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="wave-divider h-16"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">
              Complete Blue Carbon <span className="text-primary">Ecosystem</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              From plantation registration to carbon credit trading, our platform provides everything you need for
              transparent and verified blue carbon projects.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="ocean-card h-full p-6 hover:scale-105 transition-all duration-300">
                  <CardContent className="p-0">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4`}
                    >
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-balance">{feature.title}</h3>
                    <p className="text-muted-foreground text-pretty leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Blue Carbon Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5"></div>

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
                What is <span className="text-primary">Blue Carbon</span>?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Blue carbon refers to the carbon captured and stored by coastal and marine ecosystems, including
                  mangroves, seagrass beds, and salt marshes. These ecosystems are among the most effective carbon sinks
                  on Earth.
                </p>
                <p>
                  Our platform enables the monitoring, reporting, and verification of blue carbon projects, creating a
                  transparent marketplace for verified carbon credits while supporting ocean conservation.
                </p>
                <p>
                  By combining blockchain technology with environmental science, we're building the future of
                  sustainable ocean management and climate action.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <Card className="ocean-card p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">10x</div>
                  <div className="text-sm text-muted-foreground">More carbon per hectare than forests</div>
                </Card>
                <Card className="ocean-card p-6 text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">50%</div>
                  <div className="text-sm text-muted-foreground">Of global carbon sequestration</div>
                </Card>
              </div>
              <div className="space-y-4 mt-8">
                <Card className="ocean-card p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">3x</div>
                  <div className="text-sm text-muted-foreground">Faster carbon storage rate</div>
                </Card>
                <Card className="ocean-card p-6 text-center">
                  <div className="text-3xl font-bold text-cyan-600 mb-2">1000+</div>
                  <div className="text-sm text-muted-foreground">Years of carbon storage</div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="ocean-card rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 ocean-gradient opacity-5"></div>
            <div className="relative">
              {/* <Waves className="h-16 w-16 text-primary mx-auto mb-6" /> */}
              <Logo height={50} width={50} className="mx-auto mb-6" />
              <h3 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                Ready to Make an <span className="text-primary">Ocean Impact</span>?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
                Join the blue carbon revolution. Register your plantation, earn verified credits, and contribute to
                ocean conservation while building a sustainable future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                  <Link href="/plantation">Register Your Plantation</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  size="lg"
                  className="border-primary/20 hover:bg-primary/5 bg-transparent"
                >
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
