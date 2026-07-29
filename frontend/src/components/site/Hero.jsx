import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap, Volume2, VolumeX } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { MaskedLine, AnimatedCounter, scrollToId } from "@/components/site/shared";

export default function Hero() {
  const { config } = useConfig();
  const hero = config.hero;
  const counter = config.counter;
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

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
      {hero.videoUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <video
            key={hero.videoUrl}
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={hero.videoPoster || hero.image}
          >
            <source src={hero.videoUrl} />
          </video>
          <div className="absolute inset-0 bg-white/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>
      ) : null}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-28 sm:pt-36 pb-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left column */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-accent-ink mb-8"
            >
              <Zap className="h-3.5 w-3.5" />
              {hero.badge}
            </motion.div>

            <h1 className="font-display font-black tracking-tighter leading-[0.95] text-4xl sm:text-6xl lg:text-7xl text-slate-900">
              <MaskedLine delay={0.15}>{hero.titleLine1}</MaskedLine>
              <MaskedLine delay={0.32} className="text-accent-ink text-glow">
                {hero.titleLine2}
              </MaskedLine>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-6 max-w-md text-base sm:text-lg text-slate-500 leading-relaxed"
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
                onClick={() => scrollToId("frota")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent-nb px-7 py-3.5 text-sm font-semibold text-[#0a0a0a] transition-transform duration-300 hover:scale-[1.04] glow-accent"
              >
                {hero.ctaPrimary}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                data-testid="hero-cta-secondary"
                onClick={() => scrollToId("frota")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 px-7 py-3.5 text-sm font-semibold text-slate-900 transition-colors duration-300 hover:border-accent-nb hover:text-accent-ink"
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
                className="font-display font-bold text-3xl sm:text-4xl text-slate-900"
              />
              <span className="text-sm text-slate-500 max-w-[180px] leading-snug">
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
              <div className="relative overflow-hidden rounded-[2rem] border border-black/10">
                <img
                  src={hero.image}
                  alt="Moto premium NB Locações"
                  loading="eager"
                  className="w-full h-[380px] sm:h-[520px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 glass rounded-2xl px-5 py-3">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">a partir de</p>
                  <p className="font-display font-bold text-2xl text-slate-900">
                    R$ {config.frota?.bikes?.[0]?.price}
                    <span className="text-sm font-normal text-slate-500">/mês</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Role</span>
        <div className="h-10 w-px bg-gradient-to-b from-accent-nb to-transparent" />
      </div>

      {hero.videoUrl ? (
        <button
          data-testid="hero-mute-btn"
          onClick={toggleMute}
          aria-label={muted ? "Ativar som" : "Desativar som"}
          className="absolute bottom-8 left-5 sm:left-8 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full glass-strong border border-black/10 text-slate-700 transition-colors duration-300 hover:text-accent-ink"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      ) : null}
    </section>
  );
}
