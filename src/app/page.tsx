import type { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "YAPONARBIRAK - Online Oto Sanayi",
  description:
    "Aracın için en uygun ustayı tek ilanla bul. Teklifleri karşılaştır, güvenilir tamir ve yedek parça hizmeti hemen yanında. Online oto sanayi artık cebinde!",
  keywords: [
    "oto tamir",
    "araç tamiri",
    "yedek parça",
    "oto sanayi",
    "tamirci bul",
    "oto ustası",
    "online tamir",
    "araç servisi",
  ],
  openGraph: {
    title: "YAPONARBIRAK - Online Oto Sanayi",
    description:
      "Aracın için en uygun ustayı tek ilanla bul. Online oto sanayi artık cebinde!",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
}
