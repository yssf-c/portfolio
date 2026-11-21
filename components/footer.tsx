"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUp, ArrowUpRight, Check, Copy } from "lucide-react";
import { ContactMesh } from "@/components/contact-mesh";

const EMAIL = "ychou031@uottawa.ca";
const EASE = [0.55, 0.45, 0.16, 1] as const;

// Each is a vertex of the mesh behind the section; `place` scatters them across it on wide screens.
const links = [
  {
    label: "GitHub",
    kind: "Code",
    name: "my GitHub",
    href: "https://github.com/yssf-c",
    place: "md:col-start-9 md:row-start-1 md:self-start",
  },
  {
    label: "LinkedIn",
    kind: "Work",
    name: "my LinkedIn",
    href: "https://linkedin.com/in/youssef-chouay",
    place: "md:col-start-7 md:row-start-3 md:self-end",
  },
  {
    label: "CV",
    kind: "On paper",
    name: "my CV",
    href: "/data/resume.pdf",
    place: "md:col-start-11 md:row-start-2 md:self-center",
  },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <footer ref={footerRef} className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-background">
      {/* The mesh; the pointer and the four links below are vertices of it */}
      <ContactMesh />

      <div className="container relative z-10 mx-auto px-6 pb-10 pt-28 md:px-12 md:pt-36">
        {/* SAY「مرحبا」HI */}
        <div className="flex items-center" aria-hidden="true">
          <motion.span
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 1, ease: EASE }}
            className="text-section font-light text-foreground"
          >
            SAY
          </motion.span>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="mx-2 flex flex-col items-center md:mx-4"
          >
            <span className="arabic-bracket text-lg md:text-xl">「</span>
            <span className="font-arabic text-xl text-[hsl(var(--gold))] md:text-3xl">مرحبا</span>
            <span className="arabic-bracket text-lg md:text-xl">」</span>
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 1, ease: EASE }}
            className="text-section font-light text-foreground"
          >
            HI
          </motion.span>
        </div>
        <h2 className="sr-only">Contact</h2>

        <p
          className="mt-8 font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-[hsl(var(--foreground-subtle))]"
          data-guide-skip
          aria-hidden="true"
        >
          Shortest path from you to <span data-path-readout className="text-[hsl(var(--gold))]" />
        </p>

        <div className="mt-14 grid gap-y-10 md:mt-10 md:min-h-[25rem] md:grid-cols-12 md:grid-rows-3 md:gap-x-6 md:gap-y-0">
          <div className="md:col-span-7 md:row-start-2 md:self-center">
            <a href={`mailto:${EMAIL}`} className="contact-terminal contact-terminal-email">
              <span data-terminal="my inbox" className="contact-dot" aria-hidden="true" />
              <span>
                <span className="contact-kind">Email</span>
                <span className="contact-label">{EMAIL}</span>
              </span>
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="ml-6 mt-4 inline-flex items-center gap-2 border border-border bg-background px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--foreground-muted))] transition-colors hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] focus-visible:border-[hsl(var(--gold))] focus-visible:text-[hsl(var(--gold))] focus-visible:outline-none"
            >
              {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              <span aria-live="polite">{copied ? "Address copied" : "Copy address"}</span>
            </button>
          </div>

          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`contact-terminal md:col-span-3 ${link.place}`}
            >
              <span data-terminal={link.name} className="contact-dot" aria-hidden="true" />
              <span>
                <span className="contact-kind">{link.kind}</span>
                <span className="contact-label">
                  {link.label}
                  <ArrowUpRight className="ml-1.5 inline h-[0.6em] w-[0.6em]" aria-hidden="true" />
                </span>
              </span>
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-20 grid gap-6 border-t border-border pt-8 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <div>
            <p className="text-sm text-foreground">
              YOUSSEF CHOUAY <span className="font-arabic text-[hsl(var(--gold))]">「يوسف شواي」</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--foreground-subtle))]">
              Software Engineer & AI Researcher
            </p>
          </div>

          <div className="flex items-center gap-4 md:justify-center">
            <span className="font-arabic text-sm text-[hsl(var(--gold))] opacity-70">صُنع بإتقان</span>
            <span className="font-mono text-[10px] tracking-wider text-[hsl(var(--foreground-faint))]">•</span>
            <span className="font-mono text-[10px] tracking-wider text-[hsl(var(--foreground-subtle))]">
              CRAFTED WITH INTENTION
            </span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[10px] tracking-wider text-[hsl(var(--foreground-subtle))] md:justify-end">
            <span>© {new Date().getFullYear()}</span>
            <a
              href="#home"
              className="inline-flex items-center gap-1.5 uppercase text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--gold))]"
            >
              Back to top
              <ArrowUp className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
