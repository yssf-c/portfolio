"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Iceberg, type IcebergApi, type IcebergLayout, type IcebergStats } from "@/components/iceberg";
import { degrees, roles } from "@/lib/profile-data";

const EASE = [0.55, 0.45, 0.16, 1] as const;

const currentRoles = roles.filter((role) => role.end === null);
const msc = degrees.find((degree) => degree.id === "msc")!;

export function About() {
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });
  const iceberg = useRef<IcebergApi | null>(null);
  const [layout, setLayout] = useState<IcebergLayout | null>(null);
  const [stats, setStats] = useState<IcebergStats | null>(null);

  const handleLayout = useCallback((next: IcebergLayout) => setLayout(next), []);
  const handleStats = useCallback((next: IcebergStats) => setStats(next), []);

  return (
    <section id="about" className="relative overflow-hidden py-28 md:py-36">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(var(--wash))] to-background" />

      {/* The iceberg of knowledge; it sits in the slot on the right */}
      <Iceberg apiRef={iceberg} onLayout={handleLayout} onStats={handleStats} />

      {layout && (
        <div className="pointer-events-none absolute inset-0 font-mono text-[10px] uppercase tracking-[0.18em]" data-guide-skip aria-hidden="true">
          <span
            className="absolute left-6 text-[hsl(var(--foreground-subtle))] lg:left-auto lg:right-12"
            style={{ top: layout.waterY - 22 }}
          >
            Sea level
          </span>
          <span
            className="absolute flex items-center gap-2 whitespace-nowrap text-[hsl(var(--gold))]"
            style={{ left: layout.dentX, top: layout.dentY, transform: "translateY(-50%)" }}
          >
            <span className="h-px w-8 bg-[hsl(var(--gold))]" />
            My dent so far
          </span>
        </div>
      )}

      <div className="container pointer-events-none relative z-10 mx-auto px-6 md:px-12">
        <div className="grid gap-x-12 gap-y-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] xl:gap-x-20">
          <div className="pointer-events-auto self-center">
            {/* IN「معلومات」FO */}
            <div ref={titleRef} className="mb-12 flex items-center md:mb-16" aria-hidden="true">
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

            <p className="max-w-xl text-2xl font-light leading-snug text-foreground md:text-[2rem] md:leading-[1.25]">
              I&apos;m slowly chipping the iceberg of knowledge, hoping to make a big enough dent to make my younger
              self proud.
            </p>

            <div className="mt-10 max-w-xl space-y-5 leading-relaxed text-[hsl(var(--foreground-soft))]">
              <p>
                I&apos;m a software engineer and researcher with a passion for creating elegant, efficient solutions
                to complex problems. Growing up curious about the world and my surroundings, I&apos;ve always wanted
                to understand how they worked, and I&apos;ve kept that approach and mindset throughout my whole life.
              </p>
              <p>
                Currently pursuing a Master&apos;s in Computer Science with a focus on Graph Theory, and working as a
                software engineer at Magnet Forensics. I&apos;m constantly exploring new technologies and ways to
                contribute.
              </p>
            </div>

            <div className="mt-10 space-y-2 font-mono text-xs uppercase tracking-[0.15em] text-[hsl(var(--foreground-muted))]">
              {currentRoles.map((role) => (
                <p key={role.id}>
                  {role.role} <span className="text-[hsl(var(--gold))]">@</span> {role.company}
                </p>
              ))}
              <p>
                {msc.short} {msc.field} <span className="text-[hsl(var(--gold))]">@</span> uOttawa
              </p>
              <p className="text-[hsl(var(--foreground-subtle))]">Based in Ottawa, Canada</p>
            </div>
          </div>

          <div>
            <div data-iceberg-slot className="h-[30rem] sm:h-[38rem] lg:h-[46rem]" />
            <div
              className="pointer-events-auto mt-6 max-w-[19rem] font-mono text-[11px] leading-relaxed text-[hsl(var(--foreground-subtle))] lg:ml-auto lg:text-right"
              data-guide-skip
            >
              <p className="text-[hsl(var(--foreground-muted))]">
                <span className="tabular-nums">{stats ? stats.facets.toLocaleString("en-CA") : "…"}</span> facets left,{" "}
                <span className="tabular-nums">{stats ? stats.chipped.toLocaleString("en-CA") : "0"}</span> chipped by you
              </p>
              <p className="mt-1">The iceberg of knowledge, triangulated. Click it to chip a piece off.</p>
              <button
                type="button"
                onClick={() => iceberg.current?.refreeze()}
                className={`mt-2 uppercase tracking-[0.16em] text-[hsl(var(--gold))] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none ${
                  stats && stats.chipped > 0 ? "" : "invisible"
                }`}
              >
                Refreeze
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
