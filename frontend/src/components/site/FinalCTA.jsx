import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { scrollToId } from "@/components/site/shared";

export default function FinalCTA() {
  const { config } = useConfig();
  const data = config.ctaFinal;

  return (
    <section
      id="cta-final"
      data-testid="cta-final-section"
      className="relative bg-white animated-gradient noise py-28 sm:py-40 overflow-hidden"
    >
      <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-black tracking-tighter text-4xl sm:text-6xl lg:text-7xl text-slate-900 leading-[0.95]"
        >
          {data.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg text-slate-500"
        >
          {data.subtitle}
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          data-testid="cta-final-btn"
          onClick={() => scrollToId("frota")}
          className="group mt-10 inline-flex items-center justify-center gap-3 rounded-full bg-accent-nb px-9 py-4 text-base font-semibold text-[#0a0a0a] transition-transform duration-300 hover:scale-[1.05] glow-accent"
        >
          {data.button}
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.button>
      </div>
    </section>
  );
}
