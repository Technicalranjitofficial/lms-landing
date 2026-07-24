import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Courses from "@/components/Courses";
import HowItWorks from "@/components/HowItWorks";
import Placements from "@/components/Placements";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="page-wrap mesh-bg noise-overlay">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Courses />
        <HowItWorks />
        <Placements />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
