"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HeroMesh, type MeshStats } from "@/components/hero-mesh";
import { LocalTime } from "@/components/local-time";
import { INTRO_MS } from "@/components/preloader";

type Layout = { size: number; gap: number; centerY: number };

const EASE = [0.55, 0.45, 0.16, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [layout, setLayout] = useState<Layout | null>(null);
  const [stats, setStats] = useState<MeshStats | null>(null);

  const handleLayout = useCallback((next: Layout) => setLayout(next), []);
  const handleStats = useCallback((next: MeshStats) => setStats(next), []);

  // On a first visit the opening curtain is still down; hold the entrance until it lifts.
  const [intro] = useState(() =>
    typeof document !== "undefined" && document.documentElement.dataset.intro === "play" ? INTRO_MS / 1000 : 0,
  );
  const delay = (seconds: number) => (reduceMotion ? 0 : seconds + intro);

  return (
    <section id="home" className="relative h-[100svh] min-h-[560px] overflow-hidden bg-background">
      <h1 className="sr-only">Youssef Chouay</h1>

      {/* YC · AY, triangulated */}
      <HeroMesh left="YC" right="AY" onLayout={handleLayout} onStats={handleStats} />

      {/* Fade the mesh into the page below */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--background)))" }}
      />

      {layout && (
        <>
          {/* Arabic name, in the gap between the letters */}
          <motion.div
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay(1.15), duration: 1, ease: EASE }}
            className="pointer-events-none absolute left-1/2 flex flex-col items-center"
            style={{
              top: layout.centerY,
              x: "-50%",
              y: "-50%",
              width: layout.gap,
              fontSize: Math.max(22, layout.size * 0.2),
            }}
          >
            <span className="arabic-bracket text-[0.6em] leading-none">「</span>
            <span className="font-arabic leading-[1.25] text-[hsl(var(--gold))]">يوسف</span>
            <span className="font-arabic leading-[1.25] text-[hsl(var(--gold))]">شواي</span>
            <span className="arabic-bracket text-[0.6em] leading-none">」</span>
          </motion.div>

          {/* Name and roles */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay(1.9), duration: 0.8, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 px-6 text-center"
            style={{ top: layout.centerY + layout.size * 0.37 + Math.max(36, layout.size * 0.2) }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[hsl(var(--foreground-muted))] md:text-sm">
              YOUSSEF [CHOUAY] ↓
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm font-light text-[hsl(var(--foreground-muted))] md:text-base">
              software engineer, AI researcher and graph theory enthusiast
            </p>
          </motion.div>

          {/* What the drawing is */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay(2.4), duration: 1 }}
            className="pointer-events-none absolute bottom-8 left-6 hidden max-w-[17rem] font-mono text-[11px] leading-relaxed text-[hsl(var(--foreground-subtle))] lg:left-10 lg:block xl:left-12"
            data-guide-skip
          >
            <p className="text-[hsl(var(--foreground-muted))]">
              <span className="tabular-nums">{stats ? stats.vertices.toLocaleString("en-CA") : "…"}</span> vertices,{" "}
              <span className="tabular-nums">{stats ? stats.triangles.toLocaleString("en-CA") : "…"}</span> triangles
            </p>
            <p className="mt-1">
              A Delaunay triangulation of my initials. Move to add a vertex, click to keep it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay(2.4), duration: 1 }}
            className="pointer-events-none absolute bottom-8 right-6 hidden text-right font-mono text-[11px] leading-relaxed text-[hsl(var(--foreground-subtle))] lg:right-10 lg:block xl:right-12"
            data-guide-skip
          >
            <p className="text-[hsl(var(--foreground-muted))]">
              Ottawa <LocalTime />
            </p>
            <p className="mt-1">45.42° N, 75.70° W</p>
          </motion.div>
        </>
      )}
    </section>
  );
}
