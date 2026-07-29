import { useEffect } from "react";
import "@/App.css";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import { ConfigProvider } from "@/context/ConfigContext";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import ComoFunciona from "@/components/site/ComoFunciona";
import Diferenciais from "@/components/site/Diferenciais";
import Frota from "@/components/site/Frota";
import SocialProof from "@/components/site/SocialProof";
import EditorialMarquee from "@/components/site/EditorialMarquee";
import FAQ from "@/components/site/FAQ";
import Localizacao from "@/components/site/Localizacao";
import FinalCTA from "@/components/site/FinalCTA";
import Footer from "@/components/site/Footer";
import FloatingButtons from "@/components/site/FloatingButtons";
import AdminPanel from "@/components/site/AdminPanel";

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    window.__lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <ConfigProvider>
      <div className="App bg-[#F4F5F7] text-slate-900 antialiased min-h-screen">
        <Navbar />
        <main>
          <Hero />
          <ComoFunciona />
          <Diferenciais />
          <Frota />
          <EditorialMarquee />
          <SocialProof />
          <FAQ />
          <Localizacao />
          <FinalCTA />
        </main>
        <Footer />
        <FloatingButtons />
        <AdminPanel />
        <Toaster position="bottom-center" theme="light" richColors />
      </div>
    </ConfigProvider>
  );
}

export default App;
