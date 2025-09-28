"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Waves } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { CustomConnectButton } from "./CustomConnectButton";

export function Navbar() {
    const pathname = usePathname();
    const [sheetOpen, setSheetOpen] = useState(false);

    const links = [
        { href: "/", label: "Home" },
        // { href: "/registration", label: "Registration" },
        { href: "/credits", label: "Credits" },
        { href: "/marketplace", label: "Marketplace" },
        { href: "/registry", label: "Registry" },
        { href: "/verification", label: "Verification" },
        { href: "/dashboard", label: "Dashboard" },
    ];

    return (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border/50">
            <div className="container mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="font-semibold flex items-center gap-2"
                    >
                        <Logo height={30} width={30} />
                        <span className="text-primary">Blue</span>
                        <span className="text-foreground">Carbon</span>
                        <span className="text-xs bg-primary text-secondary-foreground px-2 py-1 rounded-full">
                            MRV
                        </span>
                    </Link>
                </div>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {links.map((l) => {
                        const active = pathname === l.href;
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                className={`text-sm font-medium transition-colors relative ${
                                    active
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-primary"
                                }`}
                            >
                                {l.label}
                            </Link>
                        );
                    })}
                    <Button>
                        <Link href="/registration" className="font-bold">
                            Registration
                        </Link>
                    </Button>
                </nav>

                {/* Desktop Connect Button & Mobile Menu */}
                <div className="flex items-center gap-4">
                    {/* Desktop Connect Button */}
                    <div className="hidden md:block">
                        <CustomConnectButton />
                    </div>

                    {/* Mobile Sheet */}
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="md:hidden bg-transparent"
                            >
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-80">
                            <div className="flex flex-col gap-6 mt-6">
                                {/* Logo */}
                                <div className="flex items-center gap-2">
                                    <Logo height={25} width={25} />
                                    <span className="text-primary font-semibold">
                                        Blue
                                    </span>
                                    <span className="text-foreground font-semibold">
                                        Carbon MRV
                                    </span>
                                </div>

                                {/* Mobile links */}
                                <nav className="flex flex-col gap-4">
                                    {links.map((l) => {
                                        const active = pathname === l.href;
                                        return (
                                            <Link
                                                key={l.href}
                                                href={l.href}
                                                onClick={() =>
                                                    setSheetOpen(false)
                                                }
                                                className={`text-sm font-medium transition-colors p-2 rounded-lg ${
                                                    active
                                                        ? "text-primary bg-primary/10"
                                                        : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                                                }`}
                                            >
                                                {l.label}
                                            </Link>
                                        );
                                    })}
                                    <Button>
                                        <Link
                                            href="/registration"
                                            className="font-bold"
                                        >
                                            Registration
                                        </Link>
                                    </Button>
                                </nav>

                                {/* Mobile Connect button */}
                                <div className="pt-4 border-t">
                                    <CustomConnectButton />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
