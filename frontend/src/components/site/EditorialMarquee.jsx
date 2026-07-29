import React from "react";
import Marquee from "react-fast-marquee";

const WORDS = ["SEM ENTRADA", "100% DIGITAL", "TUDO INCLUSO", "TROCA FLEXÍVEL", "COBERTURA 24H"];

export default function EditorialMarquee() {
  return (
    <section data-testid="marquee-section" className="relative bg-white py-10 border-y border-black/10 overflow-hidden">
      <Marquee speed={40} gradient={false} autoFill>
        <div className="flex items-center gap-10 pr-10">
          {WORDS.map((w, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className="font-display font-black text-4xl sm:text-6xl text-outline">
                {w}
              </span>
              <span className="text-accent-ink text-3xl sm:text-5xl" aria-hidden="true">
                /
              </span>
            </span>
          ))}
        </div>
      </Marquee>
    </section>
  );
}
