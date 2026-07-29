import React from "react";
import { MapPin, Clock, Phone, MessageCircle, Navigation } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { SectionHeading, Reveal } from "@/components/site/shared";

export default function Localizacao() {
  const { config } = useConfig();
  const data = config.localizacao;

  const openMaps = () => window.open(data.mapsLink, "_blank");
  const openWhats = () => {
    const num = (config.whatsapp?.number || "").replace(/\D/g, "");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(config.whatsapp.message)}`, "_blank");
  };

  return (
    <section id="localizacao" data-testid="localizacao-section" className="relative bg-[#F4F5F7] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Localização" title={data.title} subtitle={data.subtitle} />

        <div className="mt-12 grid lg:grid-cols-3 gap-5">
          <Reveal className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 h-[320px] sm:h-[460px]">
              <iframe
                title="Mapa NB Locações"
                src={data.mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
                style={{ border: 0, filter: "grayscale(1) invert(0.9) hue-rotate(180deg) brightness(1.05) contrast(0.9)" }}
                allowFullScreen
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-accent-nb/20 rounded-3xl" />
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="h-full rounded-3xl glass-strong border border-black/10 p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-accent-ink shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Endereço</p>
                    <p className="text-sm text-slate-700 mt-1">{data.address}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-accent-ink shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Horário</p>
                    <p className="text-sm text-slate-700 mt-1">{data.hours}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="h-5 w-5 text-accent-ink shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Telefone</p>
                    <p className="text-sm text-slate-700 mt-1">{data.phone}</p>
                    <p className="text-sm text-slate-700">WhatsApp: {data.whatsapp}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  data-testid="como-chegar-btn"
                  onClick={openMaps}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent-nb px-6 py-3.5 font-semibold text-[#0a0a0a] transition-transform duration-300 hover:scale-[1.03]"
                >
                  <Navigation className="h-4 w-4" /> Como chegar
                </button>
                <button
                  data-testid="local-whatsapp-btn"
                  onClick={openWhats}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-black/15 px-6 py-3.5 font-semibold text-slate-900 transition-colors duration-300 hover:border-accent-nb hover:text-accent-ink"
                >
                  <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
