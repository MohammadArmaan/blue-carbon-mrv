"use client"

import { type PropsWithChildren, useMemo } from "react"
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit"
import { WagmiProvider, createConfig, http } from "wagmi"
import { injected } from "wagmi/connectors"
import { sepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.drpc.org"

// ✅ Only MetaMask / injected connector
const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
})

export function WalletProvider({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => new QueryClient(), [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={{
            lightMode: lightTheme({
              accentColor: "hsl(var(--primary))",
              borderRadius: "large",
            }),
            darkMode: darkTheme({
              accentColor: "hsl(var(--primary))",
              borderRadius: "large",
            }),
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
