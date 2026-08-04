import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
    containScroll: "trimSnaps",
  });

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
      emblaApi.scrollTo(0);
    }
  }, [active, emblaApi, bikes.length]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const openBike = (bike) => {
    const num = (config.whatsapp?.number || "").replace(/\D/g, "");
    const msg = `Olá! Vim pelo site da NB Locações e quero assinar a ${bike.name} (a partir de R$ ${bike.price}/mês). Pode me ajudar?`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <section id="frota" data-testid="frota-section" className="relative bg-white py-24 sm:py-32">
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
                    : "border-black/10 text-slate-600 hover:text-slate-900 hover:border-black/25"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5 touch-pan-y">
              {bikes.map((bike) => (
                <article
                  key={bike.id}
                  data-testid={`bike-card-${bike.id}`}
                  className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white flex-[0_0_85%] sm:flex-[0_0_46%] lg:flex-[0_0_31%]"
                >
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: "radial-gradient(60% 60% at 50% 40%, rgb(var(--nb-accent-rgb) / 0.22), transparent 70%)" }}
                    />
                    {bike.image ? (
                      <img
                        src={bike.image}
                        alt={bike.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400 font-display font-semibold">
                        {bike.name}
                      </div>
                    )}
                    <span className="absolute top-4 left-4 z-20 rounded-full glass px-3 py-1 text-xs text-slate-700">
                      {bike.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-semibold text-xl text-slate-900">{bike.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{bike.specs}</p>
                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">a partir de</p>
                        <p className="font-display font-bold text-2xl text-slate-900">
                          R$ {bike.price}
                          <span className="text-sm font-normal text-slate-500">/mês</span>
                        </p>
                      </div>
                      <button
                        data-testid={`bike-cta-${bike.id}`}
                        onClick={() => openBike(bike)}
                        aria-label={`Assinar ${bike.name}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent-nb/10 text-accent-ink transition-colors duration-300 hover:bg-accent-nb hover:text-[#0a0a0a]"
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-slate-400">Arraste para explorar a frota</p>
            <div className="flex gap-2">
              <button
                data-testid="frota-prev"
                onClick={scrollPrev}
                aria-label="Moto anterior"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-slate-600 transition-colors duration-300 hover:border-accent-nb hover:text-accent-ink"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                data-testid="frota-next"
                onClick={scrollNext}
                aria-label="Próxima moto"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-slate-600 transition-colors duration-300 hover:border-accent-nb hover:text-accent-ink"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
