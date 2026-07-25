import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Gauge, Check, MessageCircle } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { Slider } from "@/components/ui/slider";
import { Reveal } from "@/components/site/shared";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Simulador() {
  const { config } = useConfig();
  const data = config.simulador;
  const bikes = config.frota.bikes;
  const tiers = data.mileageTiers;

  const [bikeId, setBikeId] = useState(bikes[0]?.id);
  const [tierIdx, setTierIdx] = useState(0);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail) setBikeId(e.detail);
    };
    window.addEventListener("nb:select-bike", handler);
    return () => window.removeEventListener("nb:select-bike", handler);
  }, []);

  const bike = bikes.find((b) => b.id === bikeId) || bikes[0];
  const tier = tiers[tierIdx] || tiers[0];
  const price = (bike?.price || 0) + (tier?.add || 0);

  const handleAssinar = async () => {
    const wa = config.whatsapp;
    const msg = `Olá! Simulei o Plano Conquiste no site da NB Locações. Moto: ${bike.name}, Plano: ${tier.label}, Mensalidade: R$ ${price}/mês. Quero prosseguir!`;
    try {
      await axios.post(`${API}/leads`, {
        name: "Lead Simulador",
        phone: wa.number,
        bike: bike.name,
        plan: tier.label,
        price,
        message: msg,
      });
    } catch (e) {
      /* silent */
    }
    window.open(`https://wa.me/${wa.number}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <section id="simulador" data-testid="simulador-section" className="relative bg-[#121212] py-24 sm:py-32 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -translate-x-1/2 h-96 w-96 rounded-full blur-[120px] opacity-30"
        style={{ background: "radial-gradient(circle, rgba(var(--nb-accent-rgb),0.5), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-accent-nb font-medium">
            <Gauge className="h-4 w-4" /> {data.title}
          </span>
          <h2 className="font-display font-bold tracking-tighter text-3xl sm:text-5xl mt-4 text-white">
            {data.subtitle}
          </h2>
        </div>

        <Reveal>
          <div className="grid lg:grid-cols-2 gap-6 rounded-[2rem] border border-white/10 glass p-6 sm:p-10">
            {/* Controls */}
            <div className="space-y-8">
              <div>
                <label className="text-sm text-white/60 mb-3 block">Escolha a moto</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bikes.map((b) => (
                    <button
                      key={b.id}
                      data-testid={`sim-bike-${b.id}`}
                      onClick={() => setBikeId(b.id)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors duration-300 ${
                        b.id === bikeId
                          ? "border-accent-nb bg-accent-nb/10 text-white"
                          : "border-white/10 text-white/60 hover:border-white/30"
                      }`}
                    >
                      <span>{b.name}</span>
                      {b.id === bikeId && <Check className="h-4 w-4 text-accent-nb" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-white/60">Quilometragem mensal</label>
                  <span data-testid="sim-tier-label" className="text-sm font-semibold text-accent-nb">
                    {tier.label}
                  </span>
                </div>
                <Slider
                  data-testid="sim-mileage-slider"
                  value={[tierIdx]}
                  min={0}
                  max={tiers.length - 1}
                  step={1}
                  onValueChange={(v) => setTierIdx(v[0])}
                  className="py-2"
                />
                <div className="flex justify-between mt-3">
                  {tiers.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setTierIdx(i)}
                      className={`text-[11px] transition-colors ${
                        i === tierIdx ? "text-accent-nb" : "text-white/35 hover:text-white/60"
                      }`}
                    >
                      {t.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="rounded-3xl bg-[#0e0e0f] border border-white/10 p-8 flex flex-col justify-between">
              <div>
                <p className="text-sm text-white/50">Sua mensalidade estimada</p>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-2xl font-display font-medium text-white/70 mb-2">R$</span>
                  <motion.span
                    key={price}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    data-testid="sim-price"
                    className="font-display font-black text-6xl sm:text-7xl text-accent-nb text-glow leading-none"
                  >
                    {price}
                  </motion.span>
                  <span className="text-lg text-white/50 mb-2">/mês</span>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-white/60">
                  {["IPVA e seguro inclusos", "Manutenção inclusa", "Sem entrada", "Cobertura 24h"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent-nb" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                data-testid="sim-assinar-btn"
                onClick={handleAssinar}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-accent-nb px-6 py-4 font-semibold text-[#0a0a0a] transition-transform duration-300 hover:scale-[1.03] glow-accent"
              >
                <MessageCircle className="h-5 w-5" />
                Assinar {bike.name}
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
