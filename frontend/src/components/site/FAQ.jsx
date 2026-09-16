import React from "react";
import { useConfig } from "@/context/ConfigContext";
import { SectionHeading, Reveal } from "@/components/site/shared";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import EditableField from "@/components/site/EditableField";

export default function FAQ() {
  const { config } = useConfig();
  const data = config.faq;

  return (
    <section id="faq" data-testid="faq-section" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading eyebrow="FAQ" title={<EditableField path="faq.title">{data.title}</EditableField>} align="center" />

        <Reveal className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {data.items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} data-testid={`faq-item-${i}`} className="border-b border-black/10">
                <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-slate-900 hover:text-accent-ink hover:no-underline py-5 [&[data-state=open]>svg]:text-accent-ink">
                  <EditableField path={`faq.items.${i}.q`}>{item.q}</EditableField>
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 leading-relaxed text-sm sm:text-base pb-5">
                  <EditableField path={`faq.items.${i}.a`} type="textarea">{item.a}</EditableField>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
