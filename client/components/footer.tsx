export function Footer() {
    return (
        <footer className="border-t">
            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} BlueCarbon MRV
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <a
                        href="https://github.com/MohammadArmaan/blue-carbon-mrv"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary"
                    >
                        Github Repo
                    </a>
                    <a
                        href="https://sepolia.etherscan.io/token/0xf8a2226c8f93c8552ff5dacb839998c0e846e77c"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary"
                    >
                        View on Etherscan
                    </a>
                </div>
            </div>
        </footer>
    );
}
