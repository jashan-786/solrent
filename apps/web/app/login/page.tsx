import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-background-100 p-4 md:p-8">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Left side: Form */}
                <div className="flex justify-center w-full">
                    <LoginForm />
                </div>

                {/* Right side: Graphic / Info */}
                <div className="hidden lg:flex flex-col justify-center bg-primary-900 rounded-3xl p-12 text-white min-h-[550px] shadow-2xl relative overflow-hidden">
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2"></div>
                    
                    <div className="relative z-10 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-secondary-400 animate-pulse"></span>
                            Solrent Protocol
                        </div>
                        
                        <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                            The future of property management on Solana.
                        </h2>
                        
                        <p className="text-primary-100 text-lg md:text-xl leading-relaxed max-w-md">
                            Experience instant settlements, transparent ledgers, and tokenized leases. All secured cryptographically.
                        </p>
                        
                        <div className="pt-12 flex items-center gap-3">
                            <div className="h-1.5 w-12 bg-secondary-500 rounded-full" />
                            <div className="h-1.5 w-3 bg-primary-400/50 rounded-full" />
                            <div className="h-1.5 w-3 bg-primary-400/50 rounded-full" />
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
