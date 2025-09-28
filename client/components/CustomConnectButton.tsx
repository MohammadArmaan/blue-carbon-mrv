"use client";

import { useState, useEffect } from "react";
import {
    useAccount,
    useBalance,
    useDisconnect,
    useChainId,
    useSwitchChain,
    useConnect,
} from "wagmi";
import { useConfig } from "wagmi";
import {
    Copy,
    LogOut,
    Wallet,
    ExternalLink,
    Shield,
    Zap,
    ChevronDown,
    Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export function CustomConnectButton() {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });
    const { disconnect } = useDisconnect();
    const chainId = useChainId();
    const config = useConfig();
    const chains = config.chains;
    const { switchChain } = useSwitchChain();
    const { connect, connectors, isPending } = useConnect();

    const [modalOpen, setModalOpen] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(false);

    // Reset modal state when connection status changes
    useEffect(() => {
        if (isConnected) {
            setModalOpen(false);
        }
    }, [isConnected]);

    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        }
    };

    // Network info including Sepolia
    const getNetworkInfo = (id?: number) => {
        const networkMap: Record<
            number,
            { name: string; color: string; icon: string }
        > = {
            1: {
                name: "Ethereum",
                color: "from-blue-500 to-blue-600",
                icon: "Ξ",
            },
            137: {
                name: "Polygon",
                color: "from-purple-500 to-purple-600",
                icon: "⬟",
            },
            56: {
                name: "BSC",
                color: "from-yellow-500 to-yellow-600",
                icon: "Ⓑ",
            },
            42161: {
                name: "Arbitrum",
                color: "from-blue-400 to-cyan-500",
                icon: "◣",
            },
            10: {
                name: "Optimism",
                color: "from-red-500 to-pink-500",
                icon: "○",
            },
            43114: {
                name: "Avalanche",
                color: "from-red-400 to-red-500",
                icon: "△",
            },
            11155111: {
                name: "Sepolia",
                color: "from-pink-500 to-pink-600",
                icon: "S",
            },
        };
        return (
            networkMap[id || 1] || {
                name: "Unknown",
                color: "from-gray-500 to-gray-600",
                icon: "?",
            }
        );
    };

    const currentNetwork = getNetworkInfo(chainId);

    // Get available connectors and map them to wallet options
    const getWalletOptions = () => {
        const walletMap = new Map([
            [
                "io.metamask",
                {
                    name: "MetaMask",
                    icon: "🦊",
                    description: "Connect using browser wallet",
                    popular: true,
                },
            ],
            [
                "walletConnect",
                {
                    name: "WalletConnect",
                    icon: "📱",
                    description: "Scan with WalletConnect to connect",
                    popular: false,
                },
            ],
            [
                "com.coinbase.wallet",
                {
                    name: "Coinbase Wallet",
                    icon: "🔵",
                    description: "Connect with Coinbase Wallet",
                    popular: false,
                },
            ],
            [
                "app.phantom",
                {
                    name: "Phantom",
                    icon: "👻",
                    description: "Connect with Phantom wallet",
                    popular: false,
                },
            ],
        ]);

        return connectors.map((connector) => {
            const walletInfo = walletMap.get(connector.id) || {
                name: connector.name,
                icon: "🔗",
                description: `Connect with ${connector.name}`,
                popular: false,
            };

            return {
                ...walletInfo,
                connector,
                id: connector.id,
            };
        });
    };

    const walletOptions = getWalletOptions();

    if (!isConnected) {
        return (
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full font-extrabold">
                        <span>Connect Wallet</span>
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md bg-background border border-border/20 rounded-3xl shadow-2xl overflow-hidden">
                    <DialogHeader className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 -m-6 mb-0 border-b border-border/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    Connect Wallet
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    Choose how you'd like to connect
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-6 pt-6">
                        <div className="space-y-3">
                            {walletOptions.map((wallet, index) => (
                                <motion.button
                                    key={wallet.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => {
                                        connect({
                                            connector: wallet.connector,
                                        });
                                    }}
                                    disabled={isPending}
                                    className="w-full p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="text-2xl">
                                        {wallet.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">
                                                {wallet.name}
                                            </span>
                                            {wallet.popular && (
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                                    Popular
                                                </span>
                                            )}
                                            {isPending && (
                                                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full animate-pulse">
                                                    Connecting...
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {wallet.description}
                                        </p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </motion.button>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-border/20 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                <span>Secure</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span>Fast</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Format address
    const formattedAddress = `${address?.slice(0, 4)}...${address?.slice(-3)}`;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 sm:gap-3 bg-blue-100 dark:bg-blue-950/20 border border-blue-300/50 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-foreground rounded-xl px-2 sm:px-4 py-2 transition-all duration-300 shadow-sm hover:shadow-md text-xs sm:text-sm w-full"
                >
                    <div
                        className={`w-6 h-6 rounded-full bg-gradient-to-br ${currentNetwork.color} flex items-center justify-center text-white font-bold text-xs sm:text-base relative`}
                    >
                        {currentNetwork.icon}
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                        <span className="font-mono font-medium truncate">
                            {formattedAddress}
                        </span>
                    </div>
                    <div className="text-xs text-foreground font-bold truncate">
                        {balance
                            ? `${parseFloat(balance.formatted).toFixed(2)} ${
                                  balance.symbol
                              }`
                            : "Loading..."}
                    </div>
                    <ChevronDown className="w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80 p-6 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/20">
                    <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentNetwork.color} flex items-center justify-center text-white font-bold relative`}
                    >
                        {currentNetwork.icon}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">
                            Connected
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                            {currentNetwork.name}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Wifi className="w-4 h-4" />
                        <span className="text-xs">Live</span>
                    </div>
                </div>

                <DropdownMenuLabel className="px-0">Network</DropdownMenuLabel>
                <div className="mb-4">
                    {chains.map((networkChain) => {
                        const networkInfo = getNetworkInfo(networkChain.id);
                        const isActive = chainId === networkChain.id;
                        return (
                            <DropdownMenuItem
                                key={networkChain.id}
                                onClick={() => {
                                    if (switchChain && !isActive) {
                                        switchChain({
                                            chainId: networkChain.id,
                                        });
                                    }
                                }}
                                className={`flex items-center gap-2 p-2 cursor-pointer ${
                                    isActive ? "bg-primary/10 text-primary" : ""
                                }`}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full bg-gradient-to-br ${networkInfo.color} flex items-center justify-center text-white text-xs`}
                                >
                                    {networkInfo.icon}
                                </div>
                                <span className="flex-1">
                                    {networkInfo.name}
                                </span>
                                {isActive && <span>✓</span>}
                            </DropdownMenuItem>
                        );
                    })}
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="px-0">Address</DropdownMenuLabel>
                <div className="font-mono text-sm bg-accent/30 p-3 rounded-lg break-all mb-4">
                    {address}
                </div>

                <DropdownMenuLabel className="px-0">Balance</DropdownMenuLabel>
                <div className="text-2xl font-bold text-foreground mb-6">
                    {balance?.formatted
                        ? parseFloat(balance.formatted).toFixed(6)
                        : "0.0000"}{" "}
                    {balance?.symbol || "ETH"}
                </div>

                <DropdownMenuSeparator />

                <div className="flex gap-3 mt-4">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopy}
                        className="flex-1 relative overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {copyFeedback ? (
                                <motion.div
                                    key="copied"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex items-center gap-1"
                                >
                                    ✓ Copied
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="copy"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex items-center gap-1"
                                >
                                    <Copy className="w-4 h-4" />
                                    <span>Copy</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                            disconnect();
                            setModalOpen(false); // Reset modal state on disconnect
                        }}
                        className="flex-1"
                    >
                        <LogOut className="w-4 h-4 mr-1" />
                        Disconnect
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
