import React from "react";
import { Star } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { Reveal, SectionHeading } from "@/components/site/shared";

export default function SocialProof() {
  const { config } = useConfig();
  const data = config.depoimentos;

  return (
    <section id="depoimentos" data-testid="depoimentos-section" className="relative bg-[#F4F5F7] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Depoimentos" title={data.title} align="center" />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {data.items.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <figure className="h-full rounded-3xl border border-black/10 bg-white p-7 flex flex-col transition-colors duration-500 hover:border-accent-nb/40">
                <div className="flex gap-1 mb-4" aria-label={`${t.rating} de 5 estrelas`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s < t.rating ? "text-accent-ink fill-current" : "text-slate-300"}`}
                    />
                  ))}
                </div>
                <blockquote className="text-slate-600 leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.photo ? (
                    <img
                      src={t.photo}
                      alt={t.name}
                      loading="lazy"
                      className="h-11 w-11 rounded-full object-cover border border-black/10"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-semibold border border-black/10">
                      {(t.name || "?").charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
