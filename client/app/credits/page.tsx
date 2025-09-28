"use client"

import { ethers } from "ethers"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { contractService } from "@/lib/contracts"
import { CONTRACT_ADDRESSES, web3Service } from "@/lib/web3"
import BlueCarbonCreditABI from "@/lib/abi/BlueCarbonCredit.json"
import { 
  Coins, 
  TrendingUp, 
  Wallet, 
  Send, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  Activity,
  DollarSign,
  BarChart3
} from "lucide-react"
import Logo from "@/components/Logo"

export default function CreditsPage() {
  const { address } = useAccount()
  const [balance, setBalance] = useState<string>("0.00")
  const [totalSupply, setTotalSupply] = useState<string>("0.00")
  const [marketPrice, setMarketPrice] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [to, setTo] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!address) return
      setLoading(true)
      try {
        // Load balance and total supply from contract
        const [balanceResult, supplyResult] = await Promise.all([
          contractService.getCarbonCreditBalance(address),
          contractService.getTotalSupply()
        ])
        
        if (mounted) {
          setBalance(contractService.formatTokenAmount(balanceResult))
          setTotalSupply(contractService.formatTokenAmount(supplyResult))
          
          // Simulate market data (in real app, fetch from price API)
          const basePrice = 25.50
          const randomChange = (Math.random() - 0.5) * 10
          setMarketPrice(basePrice + randomChange)
          setPriceChange(randomChange)

          // Load real transaction history
          await loadTransactions()
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    async function loadTransactions() {
      try {
        // Get provider from web3Service instead of contractService
        const signer = web3Service.getSignerSync()
        if (!signer || !signer.provider) return

        const contract = new ethers.Contract(
          CONTRACT_ADDRESSES.CARBON_CREDIT,
          BlueCarbonCreditABI.abi,
          signer.provider
        )

        // Get recent Transfer events involving this address
        const transferFilter = contract.filters.Transfer(null, null, null)
        const events = await contract.queryFilter(transferFilter, -1000, 'latest')

        // Filter events where user is sender or receiver and format them
        const userEvents = events
          .filter((event: any) => {
            const args = event.args
            return args && (args[0] === address || args[1] === address) // from or to
          })
          .sort((a: any, b: any) => b.blockNumber - a.blockNumber)
          .slice(0, 10)

        const formattedTransactions = await Promise.all(
          userEvents.map(async (event: any) => {
            try {
              const block = await event.getBlock()
              const timestamp = new Date(block.timestamp * 1000)
              const timeAgo = getTimeAgo(timestamp)
              
              const [from, to, value] = event.args
              const isReceived = to === address
              
              return {
                id: event.transactionHash,
                type: isReceived ? 'received' : 'sent',
                amount: ethers.formatEther(value),
                address: isReceived ? from : to,
                timestamp: timeAgo,
                hash: event.transactionHash
              }
            } catch (error) {
              console.error("Error processing transaction event:", error)
              return null
            }
          })
        )

        const validTransactions = formattedTransactions.filter(tx => tx !== null)

        if (mounted) {
          setTransactions(validTransactions)
        }
      } catch (error) {
        console.error("Error loading transactions:", error)
        // Fallback to empty array if blockchain query fails
        if (mounted) {
          setTransactions([])
        }
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [address])

  function getTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  const transfer = async () => {
    try {
      if (!to || !amount) return toast.error("Enter recipient and amount")
      const ok = await contractService.transferCarbonCredits(to, amount)
      if (ok) {
        toast.success("Transfer successful")
        if (address) {
          const b = await contractService.getCarbonCreditBalance(address)
          setBalance(contractService.formatTokenAmount(b))
          // Refresh transactions after successful transfer
          setTimeout(() => {
            window.location.reload() // Simple way to refresh transaction list
          }, 2000)
        }
        setTo("")
        setAmount("")
      } else {
        toast.error("Transfer failed")
      }
    } catch (e: unknown) {
      const err = e as Error
      toast.error(err.message || "Transfer failed")
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Logo height={20} width={20} />
            <span className="text-sm font-medium text-primary">Blue Carbon Ecosystem</span>
          </div>
          <h1 className="text-4xl font-bold text-primary">
            Carbon Credits Dashboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your blue carbon credits, monitor global supply, and participate in the sustainable future marketplace
          </p>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Supply Card */}
          <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                Total Supply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {loading ? (
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                  ) : (
                    `${totalSupply} BCC`
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  Global Carbon Credits
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Market Price Card */}
          <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                Market Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    formatPrice(marketPrice)
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {priceChange >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    priceChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatChange(Math.abs(priceChange))}
                  </span>
                  <span className="text-xs text-muted-foreground">24h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Balance Card */}
          <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                Your Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {loading ? (
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                  ) : (
                    `${balance} BCC`
                  )}
                </div>
                <div className="text-sm text-green-500">
                  ≈ {formatPrice(parseFloat(balance.replace(/,/g, '')) * marketPrice)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Value Card */}
          <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    formatPrice(parseFloat(balance.replace(/,/g, '')) * marketPrice)
                  )}
                </div>
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  <Coins className="w-3 h-3 mr-1" />
                  Blue Carbon Assets
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transfer & Recent Transactions Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Transfer Section */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-300">
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <Send className="w-6 h-6 text-primary" />
                </div>
                Transfer Credits
                <Badge variant="secondary" className="ml-auto">
                  Instant Transfer
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="to" className="font-medium">Recipient Address</Label>
                  <Input 
                    id="to" 
                    value={to} 
                    onChange={(e) => setTo(e.target.value)} 
                    placeholder="0x..." 
                    
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amt" className="font-medium">Amount (BCC)</Label>
                  <Input
                    id="amt"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    
                  />
                </div>
              </div>
              <Button 
                onClick={transfer} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 text-lg group transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
              >
                <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Send Carbon Credits
                <ArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
              {amount && (
                <div className="p-4 rounded-lg bg-muted/50 border border-primary/20">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Estimated USD Value:</span>
                    <span className="font-medium text-primary">
                      {formatPrice(parseFloat(amount || '0') * marketPrice)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                Recent Transactions
                <Badge variant="outline" className="ml-auto">
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Transaction Items */}
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          tx.type === 'received' ? 'bg-green-100 dark:bg-green-900/30' :
                          tx.type === 'sent' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          {tx.type === 'received' && <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />}
                          {tx.type === 'sent' && <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />}
                          {tx.type === 'mint' && <Coins className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {tx.type === 'mint' ? 'Credits Minted' : tx.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.type === 'mint' ? tx.address : `${tx.address.slice(0, 6)}...${tx.address.slice(-4)}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          tx.type === 'received' ? 'text-green-600 dark:text-green-400' :
                          tx.type === 'sent' ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`}>
                          {tx.type === 'sent' ? '-' : '+'}
                          {contractService.formatTokenAmount(tx.amount)} BCC
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {transactions.length > 0 && (
                <Button variant="outline" className="w-full mt-4">
                  <a href="https://sepolia.etherscan.io/token/0xf8a2226c8f93c8552ff5dacb839998c0e846e77c?a=0x6fcd6344267f2d7c4d09914437a06cef3fc2e304" target="_blank" rel="noreferer">View All Transactions</a>
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}