import React from "react";
import { Instagram, MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { scrollToId } from "@/components/site/shared";

const QUICK_LINKS = [
  { label: "Início", id: "hero" },
  { label: "Como Funciona", id: "como-funciona" },
  { label: "Frota", id: "frota" },
  { label: "FAQ", id: "faq" },
];

export default function Footer() {
  const { config } = useConfig();
  const f = config.footer;

  return (
    <footer data-testid="footer" className="relative bg-[#0a0a0b] border-t border-white/10 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1 */}
          <div>
            <div className="font-display font-extrabold text-xl text-white">
              {config.brand?.name?.split(" ")[0]}
              <span className="text-accent-nb">.</span>{" "}
              <span className="text-white/70 text-sm font-medium">
                {config.brand?.name?.split(" ").slice(1).join(" ")}
              </span>
            </div>
            <p className="mt-4 text-sm text-white/50 leading-relaxed max-w-xs">{f.description}</p>
            <a
              href={f.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-instagram"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-accent-nb hover:border-accent-nb transition-colors"
            >
              <Instagram className="h-4 w-4" /> {f.instagram}
            </a>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest">Links rápidos</h4>
            <ul className="mt-4 space-y-3">
              {QUICK_LINKS.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => scrollToId(l.id)}
                    data-testid={`footer-link-${l.id}`}
                    className="text-sm text-white/50 hover:text-accent-nb transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest">Endereço</h4>
            <div className="mt-4 flex gap-2 text-sm text-white/50">
              <MapPin className="h-4 w-4 text-accent-nb shrink-0 mt-0.5" />
              <address className="not-italic leading-relaxed">
                {f.address.street}
                <br />
                {f.address.district}
                <br />
                {f.address.city}
                <br />
                {f.address.cep}
              </address>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest">Contato</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/50">
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-accent-nb" /> {f.contact.whatsapp}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent-nb" /> {f.contact.phone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent-nb" /> {f.contact.email}
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-accent-nb" /> {f.contact.instagram}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            {f.cnpj} · © {new Date().getFullYear()} {config.brand?.name}
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <button className="hover:text-white/70 transition-colors">Política de Privacidade</button>
            <button className="hover:text-white/70 transition-colors">Termos de Uso</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
