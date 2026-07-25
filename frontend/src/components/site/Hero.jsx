import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { MaskedLine, AnimatedCounter, scrollToId } from "@/components/site/shared";

export default function Hero() {
  const { config } = useConfig();
  const hero = config.hero;
  const counter = config.counter;
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      id="hero"
      ref={ref}
      data-testid="hero-section"
      className="relative min-h-screen animated-gradient grid-pattern noise overflow-hidden"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-28 sm:pt-36 pb-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left column */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-accent-nb mb-8"
            >
              <Zap className="h-3.5 w-3.5" />
              {hero.badge}
            </motion.div>

            <h1 className="font-display font-black tracking-tighter leading-[0.95] text-4xl sm:text-6xl lg:text-7xl text-white">
              <MaskedLine delay={0.15}>{hero.titleLine1}</MaskedLine>
              <MaskedLine delay={0.32} className="text-accent-nb text-glow">
                {hero.titleLine2}
              </MaskedLine>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-6 max-w-md text-base sm:text-lg text-white/60 leading-relaxed"
            >
              {hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-9 flex flex-col sm:flex-row gap-4"
            >
              <button
                data-testid="hero-cta-primary"
                onClick={() => scrollToId("simulador")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent-nb px-7 py-3.5 text-sm font-semibold text-[#0a0a0a] transition-transform duration-300 hover:scale-[1.04] glow-accent"
              >
                {hero.ctaPrimary}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                data-testid="hero-cta-secondary"
                onClick={() => scrollToId("frota")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:border-accent-nb hover:text-accent-nb"
              >
                {hero.ctaSecondary}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mt-12 flex items-center gap-4"
            >
              <AnimatedCounter
                value={counter.value}
                suffix={counter.suffix}
                className="font-display font-bold text-3xl sm:text-4xl text-white"
              />
              <span className="text-sm text-white/50 max-w-[180px] leading-snug">
                {counter.label}
              </span>
            </motion.div>
          </div>

          {/* Right column — motorcycle */}
          <div className="lg:col-span-6 relative">
            <motion.div
              style={{ y: glowY }}
              aria-hidden="true"
              className="absolute inset-0 -z-10 blur-[90px] opacity-60"
            >
              <div
                className="absolute right-6 top-10 h-72 w-72 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(var(--nb-accent-rgb),0.55), transparent 70%)" }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ y: imgY, scale: imgScale }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
                <img
                  src={hero.image}
                  alt="Moto premium NB Locações"
                  loading="eager"
                  className="w-full h-[380px] sm:h-[520px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 glass rounded-2xl px-5 py-3">
                  <p className="text-xs text-white/50 uppercase tracking-widest">a partir de</p>
                  <p className="font-display font-bold text-2xl text-white">
                    R$ {config.frota?.bikes?.[0]?.price}
                    <span className="text-sm font-normal text-white/50">/mês</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Role</span>
        <div className="h-10 w-px bg-gradient-to-b from-accent-nb to-transparent" />
      </div>
    </section>
  );
}
