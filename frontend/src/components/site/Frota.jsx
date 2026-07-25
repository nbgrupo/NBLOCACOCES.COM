import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { SectionHeading } from "@/components/site/shared";

export default function Frota() {
  const { config } = useConfig();
  const data = config.frota;
  const [active, setActive] = useState("Todas");

  const bikes =
    active === "Todas"
      ? data.bikes
      : data.bikes.filter((b) => b.category === active);

  const selectBike = (bike) => {
    window.dispatchEvent(new CustomEvent("nb:select-bike", { detail: bike.id }));
    const el = document.getElementById("simulador");
    if (el) {
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80 });
      else el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="frota" data-testid="frota-section" className="relative bg-[#0e0e0f] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <SectionHeading eyebrow="Frota" title={data.title} subtitle={data.subtitle} />

          <div className="flex flex-wrap gap-2">
            {data.categories.map((cat) => (
              <button
                key={cat}
                data-testid={`filter-${cat}`}
                onClick={() => setActive(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 border ${
                  active === cat
                    ? "bg-accent-nb text-[#0a0a0a] border-transparent"
                    : "border-white/15 text-white/70 hover:text-white hover:border-white/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {bikes.map((bike, i) => (
              <motion.article
                layout
                key={bike.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                data-testid={`bike-card-${bike.id}`}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#1a1a1c]"
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(var(--nb-accent-rgb),0.22), transparent 70%)" }}
                  />
                  <img
                    src={bike.image}
                    alt={bike.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute top-4 left-4 z-20 rounded-full glass px-3 py-1 text-xs text-white/80">
                    {bike.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display font-semibold text-xl text-white">{bike.name}</h3>
                  <p className="text-sm text-white/45 mt-1">{bike.specs}</p>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-widest">a partir de</p>
                      <p className="font-display font-bold text-2xl text-white">
                        R$ {bike.price}
                        <span className="text-sm font-normal text-white/50">/mês</span>
                      </p>
                    </div>
                    <button
                      data-testid={`bike-simular-${bike.id}`}
                      onClick={() => selectBike(bike)}
                      aria-label={`Simular ${bike.name}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent-nb/10 text-accent-nb transition-colors duration-300 hover:bg-accent-nb hover:text-[#0a0a0a]"
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
