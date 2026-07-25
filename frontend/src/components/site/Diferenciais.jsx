import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  ShieldCheck,
  Wrench,
  Repeat,
  Smartphone,
  Clock,
  Sparkles,
} from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { SectionHeading } from "@/components/site/shared";

const ICONS = {
  wallet: Wallet,
  shield: ShieldCheck,
  wrench: Wrench,
  repeat: Repeat,
  smartphone: Smartphone,
  clock: Clock,
};

// Bento span pattern for asymmetric grid
const SPANS = [
  "md:col-span-2 md:row-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-2",
];

export default function Diferenciais() {
  const { config } = useConfig();
  const data = config.diferenciais;

  return (
    <section
      id="diferenciais"
      data-testid="diferenciais-section"
      className="relative bg-[#121212] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Diferenciais" title={data.title} subtitle={data.subtitle} />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
          {data.items.map((item, i) => {
            const Icon = ICONS[item.icon] || Sparkles;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                data-testid={`diferencial-${i}`}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-[#1a1a1c] p-7 flex flex-col justify-between transition-colors duration-500 hover:border-accent-nb/40 ${SPANS[i] || ""}`}
              >
                <div
                  aria-hidden="true"
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
                  style={{ background: "radial-gradient(circle, rgba(var(--nb-accent-rgb),0.25), transparent 70%)" }}
                />
                <div className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-nb/10 text-accent-nb">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-display font-semibold text-xl text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/55 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
