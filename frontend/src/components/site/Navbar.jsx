import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { scrollToId } from "@/components/site/shared";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const LINKS = [
  { label: "Início", id: "hero" },
  { label: "Como Funciona", id: "como-funciona" },
  { label: "Frota", id: "frota" },
  { label: "FAQ", id: "faq" },
];

export default function Navbar() {
  const { config } = useConfig();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled ? "glass-strong border-b border-white/10" : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <button
          data-testid="logo-btn"
          onClick={() => scrollToId("hero")}
          className="flex items-center gap-2 font-display font-extrabold text-lg sm:text-xl tracking-tight text-white"
        >
          {config.brand?.name?.split(" ")[0] || "NB"}
          <span className="text-accent-nb">.</span>
          <span className="text-white/70 font-medium text-sm hidden sm:inline">
            {config.brand?.name?.split(" ").slice(1).join(" ")}
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <button
              key={l.id}
              data-testid={`nav-${l.id}`}
              onClick={() => scrollToId(l.id)}
              className="text-sm text-white/70 hover:text-white transition-colors duration-300 relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent-nb transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        <button
          data-testid="nav-cta"
          onClick={() => scrollToId("frota")}
          className="hidden md:inline-flex items-center rounded-full bg-accent-nb px-5 py-2 text-sm font-semibold text-[#0a0a0a] transition-transform duration-300 hover:scale-[1.04] glow-accent"
        >
          Assinar
        </button>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button data-testid="mobile-menu-btn" aria-label="Abrir menu" className="text-white p-2">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-strong border-white/10 text-white w-72">
              <div className="flex items-center justify-between mb-10">
                <span className="font-display font-extrabold text-lg">
                  {config.brand?.name}
                </span>
                <SheetClose asChild>
                  <button aria-label="Fechar menu" className="p-1">
                    <X className="h-5 w-5" />
                  </button>
                </SheetClose>
              </div>
              <div className="flex flex-col gap-5">
                {LINKS.map((l) => (
                  <SheetClose asChild key={l.id}>
                    <button
                      data-testid={`mobile-nav-${l.id}`}
                      onClick={() => scrollToId(l.id)}
                      className="text-left text-lg text-white/80 hover:text-accent-nb transition-colors"
                    >
                      {l.label}
                    </button>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <button
                    data-testid="mobile-nav-cta"
                    onClick={() => scrollToId("frota")}
                    className="mt-4 rounded-full bg-accent-nb px-5 py-3 font-semibold text-[#0a0a0a]"
                  >
                    Assinar agora
                  </button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
