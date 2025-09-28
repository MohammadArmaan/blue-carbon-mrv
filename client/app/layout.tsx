import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/providers/wallet-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // choose weights you need
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Blue Carbon MRV - Ocean Conservation Platform",
  description:
    "A cutting-edge Web3 platform for Blue Carbon Monitoring, Reporting, and Verification",
  openGraph: {
    title: "Blue Carbon MRV - Ocean Conservation Platform",
    description:
      "A cutting-edge Web3 platform for Blue Carbon Monitoring, Reporting, and Verification",
    url: "https://blue-carbon-mrv-project.vercel.app/", 
    siteName: "Blue Carbon MRV",
    images: [
      {
        url: "/logo.png", 
        width: 500,
        height: 500,
        alt: "Blue Carbon MRV Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blue Carbon MRV - Ocean Conservation Platform",
    description:
      "A cutting-edge Web3 platform for Blue Carbon Monitoring, Reporting, and Verification",
    images: ["/logo.png"],
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} antialiased`}>
      <body className="font-sans antialiased">
        <Suspense fallback={<div>Loading...</div>}>
          <WalletProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              <Toaster position="top-center" richColors />
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </WalletProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
