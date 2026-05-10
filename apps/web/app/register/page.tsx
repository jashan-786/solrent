import { RegisterForm } from "@/components/auth/register-form";
import { Home, Link } from "lucide-react";

export default function RegisterPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-background-100 p-4 md:p-8">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                <div className="hidden lg:flex flex-col justify-center bg-accent-950 rounded-3xl p-12 text-white min-h-[600px] shadow-2xl relative overflow-hidden order-2 lg:order-1">

                    <div className="absolute top-0 left-0 w-80 h-80 bg-accent-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/4"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/3 translate-y-1/3"></div>

                    <div className="relative z-10 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-secondary-400"></span>
                            Create Account
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                            Join the Web3 Real Estate Revolution.
                        </h2>

                        <p className="text-accent-100 text-lg md:text-xl leading-relaxed max-w-md">
                            Sign up with your Solana wallet. No passwords to forget. Cryptographically secure smart-contract leases.
                        </p>

                        <div className="pt-12 flex items-center gap-3">
                            <div className="h-1.5 w-3 bg-accent-400/50 rounded-full" />
                            <div className="h-1.5 w-12 bg-secondary-500 rounded-full" />
                            <div className="h-1.5 w-3 bg-accent-400/50 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 w-full order-1 lg:order-2">
                    <Link href="/" className="inline-flex items-center gap-2 text-text-500 hover:text-accent-900 transition-colors font-medium lg:justify-end">
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                    <RegisterForm />
                </div>

            </div>
        </main>
    );
}
