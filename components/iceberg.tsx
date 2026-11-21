"use client";

import { useEffect, useRef } from "react";
import { triangulate } from "@/lib/delaunay";
import { mulberry32 } from "@/lib/rng";
import { watchPalette, type Palette } from "@/lib/canvas-palette";

/**
 * "Chipping at the iceberg of knowledge", drawn literally: a triangulated
 * iceberg, mostly under water, that loses the facets you click. The canvas
 * fills its parent; the iceberg sits in the element marked
 * `data-iceberg-slot`. Chips are remembered between visits.
 */

export type IcebergStats = { facets: number; chipped: number };
export type IcebergLayout = { waterY: number; dentX: number; dentY: number };
export type IcebergApi = { refreeze: () => void };

type Props = {
  apiRef?: React.RefObject<IcebergApi | null>;
  onLayout?: (layout: IcebergLayout) => void;
  onStats?: (stats: IcebergStats) => void;
};

// The silhouette, clockwise from the left end of the waterline. One unit is
// roughly half the iceberg's width; y is 0 at the water, negative above it.
const OUTLINE: [number, number][] = [
  [-0.5, 0], [-0.45, -0.09], [-0.33, -0.14], [-0.27, -0.27], [-0.14, -0.33], [-0.04, -0.46],
  [0.06, -0.39], [0.13, -0.27], [0.25, -0.22], [0.34, -0.12], [0.47, 0],
  [0.63, 0.1], [0.8, 0.27], [0.9, 0.52], [0.85, 0.77], [0.71, 0.95], [0.67, 1.17], [0.51, 1.39],
  [0.37, 1.61], [0.19, 1.79], [0.03, 1.92],
  [-0.13, 1.78], [-0.29, 1.66], [-0.42, 1.42], [-0.6, 1.25], [-0.7, 1], [-0.86, 0.8], [-0.92, 0.52],
  [-0.8, 0.26], [-0.63, 0.1],
];
const TOP = 0.46;
const BOTTOM = 1.92;
const HALF_WIDTH = 0.92;
/** The bite already taken out of the tip. */
const DENT = { x: 0.3, y: -0.17, r: 0.085 };
const CHIP_RADIUS = 0.1;
const STORAGE_KEY = "yc-iceberg-v1";

type Facet = { a: number; b: number; c: number; x: number; y: number; tone: number };

function inside(x: number, y: number) {
  let hit = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i];
    const [xj, yj] = OUTLINE[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function edgeDistance(x: number, y: number) {
  let best = Infinity;
  for (let i = 0; i < OUTLINE.length; i++) {
    const [ax, ay] = OUTLINE[i];
    const [bx, by] = OUTLINE[(i + 1) % OUTLINE.length];
    const dx = bx - ax, dy = by - ay;
    const t = Math.min(1, Math.max(0, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(x - ax - t * dx, y - ay - t * dy));
  }
  return best;
}

/** The iceberg in its own units. Seeded, so facet numbers mean the same thing on every visit. */
function buildModel() {
  const random = mulberry32(1912);
  const x: number[] = [], y: number[] = [], z: number[] = [];

  for (let i = 0; i < OUTLINE.length; i++) {
    const [ax, ay] = OUTLINE[i];
    const [bx, by] = OUTLINE[(i + 1) % OUTLINE.length];
    const steps = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 0.085));
    for (let k = 0; k < steps; k++) {
      x.push(ax + ((bx - ax) * k) / steps);
      y.push(ay + ((by - ay) * k) / steps);
      z.push(0);
    }
  }
  for (let tries = 0; tries < 9000; tries++) {
    const cx = -0.95 + random() * 1.9;
    const cy = -0.48 + random() * 2.42;
    if (!inside(cx, cy)) continue;
    // Finer near the tip, coarser in the deep.
    const gap = cy < 0.05 ? 0.058 : 0.07 + Math.min(1, cy / 1.3) * 0.035;
    const edge = edgeDistance(cx, cy);
    if (edge < gap * 0.55) continue;
    let free = true;
    for (let i = 0; i < x.length && free; i++) {
      if ((x[i] - cx) ** 2 + (y[i] - cy) ** 2 < gap * gap) free = false;
    }
    if (!free) continue;
    x.push(cx);
    y.push(cy);
    // Height off the page: the middle bulges, and every point is a little off, so facets catch the light differently.
    z.push(0.22 + Math.sqrt(edge) * 0.9 + random() * 0.17);
  }

  const count = x.length;
  const points = { x: x.slice(), y: y.slice() };
  const light = [-0.5, -0.72, 0.48];
  const lightLength = Math.hypot(...light);
  const facets: Facet[] = [];
  for (const t of triangulate(points)) {
    if (t.a >= count || t.b >= count || t.c >= count) continue;
    const cx = (x[t.a] + x[t.b] + x[t.c]) / 3;
    const cy = (y[t.a] + y[t.b] + y[t.c]) / 3;
    if (!inside(cx, cy)) continue;
    const ux = x[t.b] - x[t.a], uy = y[t.b] - y[t.a], uz = z[t.b] - z[t.a];
    const vx = x[t.c] - x[t.a], vy = y[t.c] - y[t.a], vz = z[t.c] - z[t.a];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
    const dot = (nx * light[0] + ny * light[1] + nz * light[2]) / (Math.hypot(nx, ny, nz) * lightLength || 1);
    facets.push({ a: t.a, b: t.b, c: t.c, x: cx, y: cy, tone: Math.min(1, Math.max(0, 0.18 + dot * 0.95)) });
  }
  // Top to bottom, so facet numbers are stable and readable.
  facets.sort((p, q) => p.y - q.y || p.x - q.x);
  const dent = facets.map((f) => Math.hypot(f.x - DENT.x, f.y - DENT.y) < DENT.r);
  return { x, y, facets, dent };
}

let cachedModel: ReturnType<typeof buildModel> | null = null;

type Shard = {
  // Corners relative to the shard's own centre, in pixels.
  ax: number; ay: number; bx: number; by: number; cx: number; cy: number;
  x: number; y: number; vx: number; vy: number;
  spin: number; turn: number;
  tone: number;
  age: number;
  wetAt: number | null;
};
type Ripple = { x: number; age: number };

export function Iceberg({ apiRef, onLayout, onStats }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacks = useRef({ onLayout, onStats });
  useEffect(() => {
    callbacks.current = { onLayout, onStats };
  }, [onLayout, onStats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const model = (cachedModel ??= buildModel());
    const { facets } = model;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 0 = there, 1 = part of the dent it starts with, 2 = chipped by the visitor.
    const gone = new Uint8Array(facets.length);
    model.dent.forEach((isDent, i) => isDent && (gone[i] = 1));
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) for (const i of saved) if (Number.isInteger(i) && i >= 0 && i < gone.length && !gone[i]) gone[i] = 2;
    } catch {
      // Nothing saved, or storage is unavailable.
    }

    let edges: [number, number][] = [];
    const refreshEdges = () => {
      const seen = new Map<number, [number, number]>();
      facets.forEach((f, i) => {
        if (gone[i]) return;
        for (const [u, v] of [[f.a, f.b], [f.b, f.c], [f.c, f.a]] as const) {
          seen.set(u < v ? u * 65536 + v : v * 65536 + u, [u, v]);
        }
      });
      edges = [...seen.values()];
    };
    const report = () => {
      let left = 0, chipped = 0;
      for (const state of gone) {
        if (!state) left++;
        else if (state === 2) chipped++;
      }
      callbacks.current.onStats?.({ facets: left, chipped });
    };
    const save = () => {
      try {
        const mine: number[] = [];
        gone.forEach((state, i) => state === 2 && mine.push(i));
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mine));
      } catch {
        // Not being remembered is fine.
      }
    };
    refreshEdges();
    report();

    let palette: Palette = { fg: "0 0% 100%", bg: "0 0% 0%", gold: "42 45% 75%" };
    let width = 0, height = 0, dpr = 1;
    let centerX = 0, waterY = 0, scale = 1;
    let frame = 0;
    let visible = false;
    let last = 0;
    let pointer: { x: number; y: number } | null = null;
    let shards: Shard[] = [];
    let ripples: Ripple[] = [];
    // Screen position of every model point this frame.
    const sx = new Float32Array(model.x.length);
    const sy = new Float32Array(model.x.length);
    let bob = 0, sin = 0, cos = 1;

    const measure = () => {
      const rect = host.getBoundingClientRect();
      const slot = host.querySelector<HTMLElement>("[data-iceberg-slot]")?.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      if (!width || !height || !slot) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      scale = Math.min(slot.width / (HALF_WIDTH * 2 + 0.1), slot.height / (TOP + BOTTOM + 0.16));
      centerX = slot.left - rect.left + slot.width / 2;
      waterY = slot.top - rect.top + (TOP + 0.08) * scale;
      callbacks.current.onLayout?.({
        waterY,
        dentX: centerX + (DENT.x + 0.05) * scale,
        dentY: waterY + (DENT.y - 0.03) * scale,
      });
      requestDraw();
    };

    const wave = (x: number, t: number) =>
      waterY + (reduceMotion ? 0 : Math.sin(x * 0.011 + t * 0.8) * 2.2 + Math.sin(x * 0.027 - t * 1.25) * 1.1);

    /** Pointer position in the iceberg's own units. */
    const toModel = (x: number, y: number) => {
      const dx = (x - centerX) / scale, dy = (y - waterY - bob) / scale;
      return { x: dx * cos + dy * sin, y: -dx * sin + dy * cos };
    };

    const facetAt = (x: number, y: number) => {
      for (let i = 0; i < facets.length; i++) {
        if (gone[i]) continue;
        const f = facets[i];
        if (Math.abs(f.x - x) > 0.2 || Math.abs(f.y - y) > 0.2) continue;
        const ax = model.x[f.a], ay = model.y[f.a], bx = model.x[f.b], by = model.y[f.b], cx = model.x[f.c], cy = model.y[f.c];
        const d1 = (x - bx) * (ay - by) - (ax - bx) * (y - by);
        const d2 = (x - cx) * (by - cy) - (bx - cx) * (y - cy);
        const d3 = (x - ax) * (cy - ay) - (cx - ax) * (y - ay);
        if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) return i;
      }
      return -1;
    };

    /** The facets a click at this point would take off. */
    const chipAt = (x: number, y: number) => {
      const hit = facetAt(x, y);
      if (hit < 0) return [];
      const taken = [hit];
      facets.forEach((f, i) => {
        if (i !== hit && !gone[i] && Math.hypot(f.x - x, f.y - y) < CHIP_RADIUS) taken.push(i);
      });
      return taken;
    };

    const chip = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left, y = clientY - rect.top;
      const at = toModel(x, y);
      const taken = chipAt(at.x, at.y);
      if (!taken.length) return;
      const random = Math.random;
      for (const i of taken) {
        gone[i] = 2;
        if (reduceMotion) continue;
        const f = facets[i];
        const px = (sx[f.a] + sx[f.b] + sx[f.c]) / 3, py = (sy[f.a] + sy[f.b] + sy[f.c]) / 3;
        const away = Math.atan2(py - y, px - x) + (random() - 0.5) * 0.9;
        const wet = py > waterY;
        const speed = wet ? 24 + random() * 46 : 70 + random() * 130;
        shards.push({
          ax: sx[f.a] - px, ay: sy[f.a] - py, bx: sx[f.b] - px, by: sy[f.b] - py, cx: sx[f.c] - px, cy: sy[f.c] - py,
          x: px, y: py,
          vx: Math.cos(away) * speed + (wet ? 0 : (px - centerX) * 0.5),
          vy: Math.sin(away) * speed - (wet ? 0 : 150 + random() * 150),
          spin: 0, turn: (random() - 0.5) * (wet ? 1.2 : 9),
          tone: f.tone, age: 0, wetAt: wet ? 0 : null,
        });
      }
      refreshEdges();
      report();
      save();
      requestDraw();
    };

    const draw = (now: number) => {
      frame = 0;
      if (!width || !height) return;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
      last = now;
      const t = now / 1000;
      const { fg, bg, gold } = palette;

      bob = reduceMotion ? 0 : Math.sin(t * 0.7) * 3.5;
      const tilt = reduceMotion ? 0 : Math.sin(t * 0.5 + 1) * 0.011;
      sin = Math.sin(tilt);
      cos = Math.cos(tilt);
      for (let i = 0; i < sx.length; i++) {
        sx[i] = centerX + (model.x[i] * cos - model.y[i] * sin) * scale;
        sy[i] = waterY + bob + (model.x[i] * sin + model.y[i] * cos) * scale;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.lineJoin = "round";

      const surface = (close: number) => {
        ctx.beginPath();
        ctx.moveTo(-2, wave(-2, t));
        for (let x = 14; x <= width + 16; x += 16) ctx.lineTo(x, wave(x, t));
        if (Number.isFinite(close)) {
          ctx.lineTo(width + 16, close);
          ctx.lineTo(-2, close);
          ctx.closePath();
        }
      };
      const tracePoints = (f: Facet) => {
        ctx.moveTo(sx[f.a], sy[f.a]);
        ctx.lineTo(sx[f.b], sy[f.b]);
        ctx.lineTo(sx[f.c], sy[f.c]);
        ctx.closePath();
      };
      const traceEdges = () => {
        ctx.beginPath();
        for (const [u, v] of edges) {
          ctx.moveTo(sx[u], sy[u]);
          ctx.lineTo(sx[v], sy[v]);
        }
      };

      // Under water: light falling off with depth, and the bulk of the ice as a faint, glassy mesh.
      ctx.save();
      surface(height + 4);
      ctx.clip();
      const depth = ctx.createLinearGradient(0, waterY, 0, waterY + scale * 1.5);
      depth.addColorStop(0, `hsl(${fg} / 0.07)`);
      depth.addColorStop(1, `hsl(${fg} / 0)`);
      ctx.fillStyle = depth;
      ctx.fillRect(0, waterY - 6, width, scale * 1.5 + 6);
      for (let i = 0; i < facets.length; i++) {
        if (gone[i]) continue;
        const f = facets[i];
        if (f.y < -0.12) continue;
        const fade = 1 - 0.62 * Math.min(1, Math.max(0, f.y / BOTTOM));
        ctx.beginPath();
        tracePoints(f);
        ctx.fillStyle = `hsl(${fg} / ${((0.03 + 0.15 * f.tone) * fade).toFixed(3)})`;
        ctx.fill();
      }
      traceEdges();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `hsl(${fg} / 0.13)`;
      ctx.stroke();
      ctx.restore();

      // Above water: solid ice.
      ctx.save();
      surface(-4);
      ctx.clip();
      for (let i = 0; i < facets.length; i++) {
        if (gone[i]) continue;
        const f = facets[i];
        if (f.y > 0.12) continue;
        ctx.beginPath();
        tracePoints(f);
        ctx.fillStyle = `hsl(${fg} / ${(0.58 + 0.42 * f.tone).toFixed(3)})`;
        ctx.fill();
      }
      traceEdges();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = `hsl(${bg} / 0.6)`;
      ctx.stroke();
      ctx.restore();

      // The water's surface.
      surface(NaN);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `hsl(${fg} / 0.3)`;
      ctx.stroke();

      // What a click would take off.
      let hovering = false;
      if (pointer) {
        const at = toModel(pointer.x, pointer.y);
        const taken = chipAt(at.x, at.y);
        hovering = taken.length > 0;
        if (hovering) {
          ctx.beginPath();
          for (const i of taken) tracePoints(facets[i]);
          ctx.fillStyle = `hsl(${gold} / 0.16)`;
          ctx.fill();
          ctx.lineWidth = 1.1;
          ctx.strokeStyle = `hsl(${gold} / 0.95)`;
          ctx.stroke();
        }
      }
      canvas.style.cursor = hovering ? "pointer" : "";

      // Pieces that have come off.
      for (const s of shards) {
        s.age += dt;
        if (s.wetAt === null) {
          s.vy += 1500 * dt;
          if (s.y + s.vy * dt > wave(s.x, t)) {
            s.wetAt = s.age;
            ripples.push({ x: s.x, age: 0 });
            s.vy *= 0.2;
            s.vx *= 0.4;
            s.turn *= 0.25;
          }
        } else {
          s.vy += (26 - s.vy) * Math.min(1, 3 * dt);
          s.vx *= 1 - Math.min(1, 1.6 * dt);
        }
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.spin += s.turn * dt;
        const life = s.wetAt === null ? 1 : 1 - (s.age - s.wetAt) / 2.6;
        if (life <= 0) continue;
        const c = Math.cos(s.spin), n = Math.sin(s.spin);
        ctx.beginPath();
        ctx.moveTo(s.x + s.ax * c - s.ay * n, s.y + s.ax * n + s.ay * c);
        ctx.lineTo(s.x + s.bx * c - s.by * n, s.y + s.bx * n + s.by * c);
        ctx.lineTo(s.x + s.cx * c - s.cy * n, s.y + s.cx * n + s.cy * c);
        ctx.closePath();
        const solid = s.wetAt === null ? 0.58 + 0.42 * s.tone : 0.05 + 0.16 * s.tone;
        ctx.fillStyle = `hsl(${fg} / ${(solid * life).toFixed(3)})`;
        ctx.fill();
        const flash = Math.max(0, 1 - s.age / 0.6);
        ctx.lineWidth = 1;
        ctx.strokeStyle = flash > 0 ? `hsl(${gold} / ${(flash * life).toFixed(3)})` : `hsl(${fg} / ${(0.22 * life).toFixed(3)})`;
        ctx.stroke();
      }
      shards = shards.filter((s) => (s.wetAt === null ? s.y < height + 80 : s.age - s.wetAt < 2.6));

      for (const r of ripples) {
        r.age += dt;
        const radius = 8 + r.age * 70;
        ctx.beginPath();
        ctx.ellipse(r.x, wave(r.x, t), radius, radius * 0.16, 0, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `hsl(${fg} / ${(Math.max(0, 1 - r.age / 1.2) * 0.45).toFixed(3)})`;
        ctx.stroke();
      }
      ripples = ripples.filter((r) => r.age < 1.2);

      if (visible && (!reduceMotion || shards.length || ripples.length)) frame = requestAnimationFrame(draw);
    };
    const requestDraw = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = event.pointerType === "touch" ? null : { x: event.clientX - rect.left, y: event.clientY - rect.top };
      requestDraw();
    };
    const onLeave = () => {
      pointer = null;
      requestDraw();
    };
    const onClick = (event: MouseEvent) => chip(event.clientX, event.clientY);

    if (apiRef) {
      apiRef.current = {
        refreeze: () => {
          gone.forEach((state, i) => state === 2 && (gone[i] = 0));
          refreshEdges();
          report();
          save();
          requestDraw();
        },
      };
    }

    const stopPalette = watchPalette((next) => {
      palette = next;
      requestDraw();
    });
    const resize = new ResizeObserver(measure);
    resize.observe(host);
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = 0;
      if (visible) requestDraw();
    });
    watcher.observe(host);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);
    measure();

    return () => {
      cancelAnimationFrame(frame);
      stopPalette();
      resize.disconnect();
      watcher.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 block" aria-hidden="true" />;
}
