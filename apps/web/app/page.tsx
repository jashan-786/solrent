import { Header, Main, Hero, Footer } from "@/components/landing";
import AutomatedLedgerCTA from "@/components/landing/automatedcta";
import { CTA } from "@/components/landing/cta";
import CommonQuestions from "@/components/landing/faq";


export default function Home() {
  return (
    <div className="text-solrent-indigo min-h-screen">
      <Header />
      <Main />
      <Hero />
      <CTA />
      <CommonQuestions />
      <AutomatedLedgerCTA />
      <Footer />
    </div>
  );
} 