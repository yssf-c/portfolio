"use client";

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUp, ArrowUpRight, Check, Copy } from "lucide-react";
import { LocalTime } from "@/components/local-time";

const EMAIL = "ychou031@uottawa.ca";
const EASE = [0.55, 0.45, 0.16, 1] as const;

const links = [
  { label: "GitHub", href: "https://github.com/yssf-c" },
  { label: "LinkedIn", href: "https://linkedin.com/in/youssef-chouay" },
  { label: "CV", href: "/data/resume.pdf" },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const currentYear = new Date().getFullYear();

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
    <footer ref={footerRef} className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden bg-background">
      {/* The name, written large behind everything */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-[14%] flex select-none justify-end pr-[2vw]"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: reduceMotion ? 0 : 60 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        <span className="footer-signature font-arabic">يوسف</span>
      </motion.div>

      <div className="container relative z-10 mx-auto px-6 pb-10 pt-32 md:px-12">
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

        <div className="mt-14 md:mt-20">
          <p className="max-w-md text-[hsl(var(--foreground-soft))]">
            Research, a role, or a project worth building. The fastest way to reach me is email.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a href={`mailto:${EMAIL}`} className="footer-email">
              {EMAIL}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center gap-2 border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--foreground-muted))] transition-colors hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] focus-visible:border-[hsl(var(--gold))] focus-visible:text-[hsl(var(--gold))] focus-visible:outline-none"
            >
              {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              <span aria-live="polite">{copied ? "Address copied" : "Copy address"}</span>
            </button>
          </div>

          <ul className="mt-12 flex flex-wrap gap-x-10 gap-y-3">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-lg font-light text-foreground transition-colors hover:text-[hsl(var(--gold))] md:text-xl"
                >
                  <span className="link-hover">{link.label}</span>
                  <ArrowUpRight
                    className="h-4 w-4 text-[hsl(var(--foreground-subtle))] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[hsl(var(--gold))]"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 grid gap-6 border-t border-border pt-8 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <div>
            <p className="text-sm text-foreground">YOUSSEF CHOUAY</p>
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
            <span data-guide-skip>
              OTTAWA <LocalTime />
            </span>
            <span>© {currentYear}</span>
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
