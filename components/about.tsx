"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LocalTime } from "@/components/local-time";
import { degrees, roles } from "@/lib/profile-data";

const EASE = [0.55, 0.45, 0.16, 1] as const;

const STATEMENT =
  "I’m a software engineer and researcher in Ottawa. I grew up curious about the world around me, always wanting to understand how it worked, and I’ve kept that mindset ever since. Today I build software at Magnet Forensics and study graph theory for my Master’s at the University of Ottawa. I’m slowly chipping at the iceberg of knowledge, hoping to make a dent big enough to make my younger self proud.";

const WORDS = STATEMENT.split(" ");

const currentRoles = roles.filter((role) => role.end === null);
const msc = degrees.find((degree) => degree.id === "msc")!;

/** The statement lights up word by word as it is scrolled through. */
function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Starts as the paragraph enters the lower part of the screen, ends as its last line reaches the middle.
      const progress = Math.min(1, Math.max(0, (vh * 0.88 - rect.top) / (rect.height + vh * 0.38)));
      el.style.setProperty("--lit", String(progress * (WORDS.length + 8)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <p ref={ref} className="about-statement">
      {WORDS.map((word, i) => (
        <span key={i} style={{ "--i": i } as React.CSSProperties}>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border py-4">
      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--foreground-subtle))]">
        {label}
      </dt>
      <dd className="mt-2 text-[15px] leading-snug text-foreground">{children}</dd>
    </div>
  );
}

export function About() {
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative overflow-hidden py-28 md:py-40">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(var(--wash))] to-background" />

      <div className="container relative z-10 mx-auto px-6 md:px-12">
        {/* IN「معلومات」FO */}
        <div ref={titleRef} className="mb-16 flex items-center md:mb-24" aria-hidden="true">
          <motion.span
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 1, ease: EASE }}
            className="text-section font-light text-foreground"
          >
            IN
          </motion.span>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="mx-2 flex flex-col items-center md:mx-4"
          >
            <span className="arabic-bracket text-lg md:text-xl">「</span>
            <span className="font-arabic text-xl text-[hsl(var(--gold))] md:text-3xl">معلومات</span>
            <span className="arabic-bracket text-lg md:text-xl">」</span>
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 1, ease: EASE }}
            className="text-section font-light text-foreground"
          >
            FO
          </motion.span>
        </div>
        <h2 className="sr-only">About Youssef</h2>

        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-20 xl:grid-cols-[minmax(0,1fr)_21rem] xl:gap-28">
          <Statement />

          <dl className="self-end border-b border-border">
            <Fact label="Now">
              {currentRoles.map((role) => (
                <span key={role.id} className="block">
                  {role.role}
                  <span className="text-[hsl(var(--foreground-muted))]">, {role.company}</span>
                </span>
              ))}
            </Fact>
            <Fact label="Studying">
              {msc.short} {msc.field}
              <span className="text-[hsl(var(--foreground-muted))]">, {msc.institution}</span>
            </Fact>
            <Fact label="Thesis">
              <span className="font-light italic text-[hsl(var(--foreground-soft))]">{msc.thesis}</span>
            </Fact>
            <Fact label="Based in">
              Ottawa, Canada
              <span className="ml-3 font-mono text-xs text-[hsl(var(--gold))]" data-guide-skip>
                <LocalTime /> local
              </span>
            </Fact>
          </dl>
        </div>
      </div>
    </section>
  );
}
