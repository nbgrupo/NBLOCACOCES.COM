import React from "react";
import { useConfig } from "@/context/ConfigContext";
import { SectionHeading, Reveal } from "@/components/site/shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const { config } = useConfig();
  const data = config.faq;

  return (
    <section id="faq" data-testid="faq-section" className="relative bg-[#0e0e0f] py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading eyebrow="FAQ" title={data.title} align="center" />

        <Reveal className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {data.items.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                data-testid={`faq-item-${i}`}
                className="border-b border-white/10"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-white hover:text-accent-nb hover:no-underline py-5 [&[data-state=open]>svg]:text-accent-nb">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/55 leading-relaxed text-sm sm:text-base pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
