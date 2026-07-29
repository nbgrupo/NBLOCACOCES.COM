import React from "react";
import { useConfig } from "@/context/ConfigContext";
import { Reveal, SectionHeading } from "@/components/site/shared";

export default function ComoFunciona() {
  const { config } = useConfig();
  const data = config.comoFunciona;

  return (
    <section
      id="como-funciona"
      data-testid="como-funciona-section"
      className="relative bg-white py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Como funciona" title={data.title} subtitle={data.subtitle} />

        <div className="mt-16 space-y-4">
          {data.steps.map((step, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div className="group grid md:grid-cols-12 gap-6 items-center border-t border-black/10 py-8 transition-colors duration-500 hover:border-accent-nb/40">
                <div className="md:col-span-2">
                  <span className="font-display font-black text-6xl sm:text-7xl text-outline group-hover:text-outline-accent transition-all duration-500">
                    0{i + 1}
                  </span>
                </div>
                <div className="md:col-span-4">
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
                    {step.title}
                  </h3>
                </div>
                <div className="md:col-span-6">
                  <p className="text-base text-slate-500 leading-relaxed max-w-md">
                    {step.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-black/10" />
        </div>
      </div>
    </section>
  );
}
