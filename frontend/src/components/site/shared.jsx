import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";

// Fade-up reveal on scroll
export function Reveal({ children, delay = 0, y = 40, className = "", once = true, ...rest }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Masked line-by-line reveal (hero signature moment)
export function MaskedLine({ children, delay = 0, className = "" }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// Animated number counter
export function AnimatedCounter({ value = 0, suffix = "", className = "", duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);
  const mv = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, mv]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

// Section heading eyebrow + title
export function SectionHeading({ eyebrow, title, subtitle, align = "left" }) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow && (
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-accent-ink font-medium">
            <span className="h-px w-8 bg-accent-nb" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.1}>
        <h2 className="font-display font-bold tracking-tighter text-3xl sm:text-4xl lg:text-5xl mt-4 text-slate-900">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.2}>
          <p className="mt-4 text-base text-slate-500 leading-relaxed">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset: -80 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
