"use client";

import { useEffect, useRef } from "react";
import { cavity, insert, triangulate, type Points, type Triangle } from "@/lib/delaunay";
import { mulberry32 } from "@/lib/rng";

/**
 * The hero monogram, drawn as a Delaunay triangulation: points are sampled
 * along and inside the letters and across the rest of the hero, triangulated,
 * and the letters are the triangles that fall inside the glyphs. The pointer
 * is a live vertex, and a click keeps it.
 */

export type MeshStats = { vertices: number; triangles: number };

type Props = {
  /** The two halves of the monogram; the gap between them is left for the Arabic name. */
  left: string;
  right: string;
  onLayout?: (layout: { size: number; gap: number; centerY: number }) => void;
  onStats?: (stats: MeshStats) => void;
};

const SWEEP_DELAY = 350;
const SWEEP_MS = 1500;
const FADE_MS = 520;
const MAX_PINNED = 160;

export function HeroMesh({ left, right, onLayout, onStats }: Props) {
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

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const layer = document.createElement("canvas");
    const layerCtx = layer.getContext("2d")!;
    // The letters at device resolution, used to cut the filled layer to shape.
    const stencil = document.createElement("canvas");

    let disposed = false;
    let frame = 0;
    let width = 0, height = 0, dpr = 1;
    let points: Points = { x: [], y: [] };
    let triangles: Triangle[] = [];
    let helper = 0; // index of the first of the three far-away helper points
    let shade: number[] = []; // per-point, so a facet keeps its tone when the mesh changes
    let drawGlyphs: (target: CanvasRenderingContext2D) => void = () => {};
    let glyphBox = { x0: 0, y0: 0, x1: 0, y1: 0 };
    let pinned = 0;
    let retries = 0;
    let started = 0;
    let pointer: { x: number; y: number } | null = null;
    let colors = { fg: "0 0% 100%", bg: "0 0% 0%", gold: "42 45% 75%" };

    const readColors = () => {
      const style = getComputedStyle(document.documentElement);
      colors = {
        fg: style.getPropertyValue("--foreground").trim(),
        bg: style.getPropertyValue("--background").trim(),
        gold: style.getPropertyValue("--gold").trim(),
      };
    };

    const build = async () => {
      const rect = host.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      if (!width || !height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [canvas, layer, stencil]) {
        c.width = width * dpr;
        c.height = height * dpr;
      }
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Only the webfont itself: next/font's metric fallback face is a local font
      // that may not exist, and waiting on it would never finish.
      const family =
        getComputedStyle(document.documentElement).getPropertyValue("--font-inter").split(",")[0].trim() ||
        "sans-serif";
      // Four letters and the gap come to about 3.5em.
      const size = Math.round(Math.min((width * 0.9) / 3.5, height * 0.4, 310));
      const font = `600 ${size}px ${family}`;
      try {
        await document.fonts.load(font);
      } catch {
        // Fall back to whatever the browser resolves.
      }
      if (disposed) return;
      // The webfont can still be on its way on a first visit: wait for it rather
      // than drawing the letters in a fallback face.
      if (!document.fonts.check(font) && retries < 5) {
        retries++;
        window.setTimeout(() => !disposed && build(), 250 * retries);
        return;
      }

      const gap = size * 0.66;
      const centerY = height * 0.43;
      ctx.font = font;
      const metrics = ctx.measureText("Y");
      const cap = metrics.actualBoundingBoxAscent || size * 0.73;
      const baseline = centerY + cap / 2;
      drawGlyphs = (target) => {
        target.font = font;
        target.textBaseline = "alphabetic";
        target.textAlign = "right";
        target.fillText(left, width / 2 - gap / 2, baseline);
        target.textAlign = "left";
        target.fillText(right, width / 2 + gap / 2, baseline);
      };
      callbacks.current.onLayout?.({ size, gap, centerY });
      const stencilCtx = stencil.getContext("2d")!;
      stencilCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stencilCtx.clearRect(0, 0, width, height);
      stencilCtx.fillStyle = "#000";
      drawGlyphs(stencilCtx);

      // Rasterise the letters once, at CSS pixel size, to test points against.
      const mask = document.createElement("canvas");
      mask.width = width;
      mask.height = height;
      const maskCtx = mask.getContext("2d", { willReadFrequently: true })!;
      maskCtx.fillStyle = "#000";
      drawGlyphs(maskCtx);
      const alpha = maskCtx.getImageData(0, 0, width, height).data;
      const inside = (x: number, y: number) => {
        const px = Math.round(x), py = Math.round(y);
        if (px < 0 || py < 0 || px >= width || py >= height) return false;
        return alpha[(py * width + px) * 4 + 3] > 127;
      };

      const random = mulberry32(20261120);
      const px: number[] = [], py: number[] = [];
      const cell = Math.max(4, size / 30);
      const grid = new Map<number, number[]>();
      const cellKey = (cx: number, cy: number) => (cx + 64) * 8192 + (cy + 64);
      const tryAdd = (x: number, y: number, r: number) => {
        const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
        const reach = Math.ceil(r / cell);
        for (let i = cx - reach; i <= cx + reach; i++)
          for (let j = cy - reach; j <= cy + reach; j++) {
            const bucket = grid.get(cellKey(i, j));
            if (!bucket) continue;
            for (const k of bucket) if ((px[k] - x) ** 2 + (py[k] - y) ** 2 < r * r) return false;
          }
        const key = cellKey(cx, cy);
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key)!.push(px.length);
        px.push(x);
        py.push(y);
        return true;
      };

      // 1. Along the outlines, densely, so the mesh follows the letterforms.
      let x0 = width, y0 = height, x1 = 0, y1 = 0;
      const outline: [number, number][] = [];
      for (let y = 0; y < height; y += 2)
        for (let x = 0; x < width; x += 2) {
          if (!inside(x, y)) continue;
          x0 = Math.min(x0, x); x1 = Math.max(x1, x);
          y0 = Math.min(y0, y); y1 = Math.max(y1, y);
          if (!inside(x - 2, y) || !inside(x + 2, y) || !inside(x, y - 2) || !inside(x, y + 2))
            outline.push([x, y]);
        }
      glyphBox = { x0, y0, x1, y1 };
      for (let i = outline.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [outline[i], outline[j]] = [outline[j], outline[i]];
      }
      const outlineGap = Math.max(6, size / 26);
      for (const [x, y] of outline) tryAdd(x, y, outlineGap);

      // 2. Inside the strokes.
      const innerGap = Math.max(8, size / 15);
      for (let i = 0; i < 16000; i++) {
        const x = x0 + random() * (x1 - x0), y = y0 + random() * (y1 - y0);
        if (inside(x, y)) tryAdd(x, y, innerGap);
      }

      // 3. Everywhere else, growing sparser away from the letters.
      const margin = 48;
      for (let i = 0; i < 9000; i++) {
        const x = -margin + random() * (width + margin * 2);
        const y = -margin + random() * (height + margin * 2);
        if (inside(x, y)) continue;
        const dx = Math.max(x0 - x, 0, x - x1), dy = Math.max(y0 - y, 0, y - y1);
        const away = Math.min(1, Math.hypot(dx, dy) / (Math.max(width, height) * 0.4));
        tryAdd(x, y, size * (0.1 + 0.34 * away));
      }
      // A ring just past the edges so the mesh always covers the hero.
      const ring = size * 0.5;
      for (let x = -margin; x <= width + margin; x += ring) {
        tryAdd(x + random() * 8, -margin - random() * 8, ring * 0.5);
        tryAdd(x + random() * 8, height + margin + random() * 8, ring * 0.5);
      }
      for (let y = -margin; y <= height + margin; y += ring) {
        tryAdd(-margin - random() * 8, y + random() * 8, ring * 0.5);
        tryAdd(width + margin + random() * 8, y + random() * 8, ring * 0.5);
      }

      points = { x: px, y: py };
      helper = px.length;
      triangles = triangulate(points);
      shade = points.x.map(() => random());
      pinned = 0;
      report();
      started = reduceMotion ? -Infinity : performance.now();
      schedule();
    };

    const report = () => {
      let count = 0;
      for (const t of triangles) if (!touchesHelper(t)) count++;
      callbacks.current.onStats?.({ vertices: points.x.length - 3, triangles: count });
    };

    const touchesHelper = (t: { a: number; b: number; c: number }) =>
      (t.a >= helper && t.a < helper + 3) ||
      (t.b >= helper && t.b < helper + 3) ||
      (t.c >= helper && t.c < helper + 3);

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const draw = (now: number) => {
      frame = 0;
      if (disposed || !width) return;
      const elapsed = now - started - SWEEP_DELAY;
      const sweeping = elapsed < SWEEP_MS + FADE_MS;
      const sweepX = (elapsed / SWEEP_MS) * (width + 80) - 40;
      const { x, y } = points;

      // The pointer joins the mesh for this frame only.
      let hole: Set<number> | null = null;
      let fan: [number, number][] = [];
      if (pointer && !sweeping) {
        const found = cavity(triangles, pointer.x, pointer.y);
        hole = new Set(found.bad);
        fan = found.edges;
      }

      type Facet = { ax: number; ay: number; bx: number; by: number; cx: number; cy: number; tone: number; show: number };
      const facets: Facet[] = [];
      const push = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number, tone: number) => {
        const mx = (ax + bx + cx) / 3;
        const show = sweeping ? Math.min(1, Math.max(0, ((sweepX - mx) / (width + 80)) * (SWEEP_MS / FADE_MS))) : 1;
        if (show > 0) facets.push({ ax, ay, bx, by, cx, cy, tone, show });
      };
      for (let i = 0; i < triangles.length; i++) {
        const t = triangles[i];
        if (hole?.has(i) || touchesHelper(t)) continue;
        push(x[t.a], y[t.a], x[t.b], y[t.b], x[t.c], y[t.c], (shade[t.a] + shade[t.b] + shade[t.c]) / 3);
      }
      if (pointer && hole)
        for (const [u, v] of fan) {
          if (u >= helper && u < helper + 3) continue;
          if (v >= helper && v < helper + 3) continue;
          push(x[u], y[u], x[v], y[v], pointer.x, pointer.y, (shade[u] + shade[v]) / 2);
        }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      layerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layerCtx.globalCompositeOperation = "source-over";
      layerCtx.clearRect(0, 0, width, height);

      const reach = Math.max(120, width * 0.11);
      const pad = 24;

      // The field: hairlines across the whole hero.
      ctx.lineWidth = 1;
      ctx.lineJoin = "round";
      for (const f of facets) {
        ctx.beginPath();
        ctx.moveTo(f.ax, f.ay);
        ctx.lineTo(f.bx, f.by);
        ctx.lineTo(f.cx, f.cy);
        ctx.closePath();
        let glow = 0;
        if (pointer && !sweeping) {
          const d = Math.hypot((f.ax + f.bx + f.cx) / 3 - pointer.x, (f.ay + f.by + f.cy) / 3 - pointer.y);
          glow = Math.max(0, 1 - d / reach) ** 2;
        }
        if (glow > 0.02) {
          ctx.strokeStyle = `hsl(${colors.gold} / ${0.07 + glow * 0.5})`;
        } else {
          ctx.strokeStyle = `hsl(${colors.fg} / ${0.075 * f.show})`;
        }
        ctx.stroke();

        // The letters: the same triangles, filled, on their own layer.
        const minX = Math.min(f.ax, f.bx, f.cx), maxX = Math.max(f.ax, f.bx, f.cx);
        const minY = Math.min(f.ay, f.by, f.cy), maxY = Math.max(f.ay, f.by, f.cy);
        if (maxX < glyphBox.x0 - pad || minX > glyphBox.x1 + pad || maxY < glyphBox.y0 - pad || minY > glyphBox.y1 + pad)
          continue;
        layerCtx.beginPath();
        layerCtx.moveTo(f.ax, f.ay);
        layerCtx.lineTo(f.bx, f.by);
        layerCtx.lineTo(f.cx, f.cy);
        layerCtx.closePath();
        layerCtx.fillStyle = `hsl(${colors.fg} / ${(0.74 + 0.26 * f.tone) * f.show})`;
        layerCtx.fill();
        if (glow > 0.02) {
          layerCtx.fillStyle = `hsl(${colors.gold} / ${glow * 0.95})`;
          layerCtx.fill();
        }
        layerCtx.lineWidth = 0.9;
        layerCtx.strokeStyle = `hsl(${colors.bg} / ${0.55 * f.show})`;
        layerCtx.stroke();
      }

      // Cut the filled layer to the true letterforms, so the edges stay crisp.
      layerCtx.globalCompositeOperation = "destination-in";
      layerCtx.setTransform(1, 0, 0, 1, 0, 0);
      layerCtx.drawImage(stencil, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(layer, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (pointer && hole) {
        ctx.strokeStyle = `hsl(${colors.gold} / 0.9)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const seen = new Set<number>();
        for (const [u, v] of fan)
          for (const k of [u, v]) {
            if (seen.has(k) || (k >= helper && k < helper + 3)) continue;
            seen.add(k);
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(x[k], y[k]);
          }
        ctx.stroke();
        ctx.fillStyle = `hsl(${colors.gold})`;
        for (const k of seen) {
          ctx.beginPath();
          ctx.arc(x[k], y[k], 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pinned vertices stay marked.
      if (pinned) {
        ctx.fillStyle = `hsl(${colors.gold})`;
        for (let k = helper + 3; k < x.length; k++) {
          ctx.beginPath();
          ctx.arc(x[k], y[k], 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (sweeping && elapsed > 0 && elapsed < SWEEP_MS) {
        const fade = Math.min(1, elapsed / 200, (SWEEP_MS - elapsed) / 300);
        ctx.strokeStyle = `hsl(${colors.gold} / ${0.75 * fade})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sweepX, 0);
        ctx.lineTo(sweepX, height);
        ctx.stroke();
      }
      if (sweeping) schedule();
    };

    const toLocal = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onMove = (event: PointerEvent) => {
      pointer = toLocal(event);
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") onLeave();
    };
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element).closest("a, button, input, textarea")) return;
      if (!triangles.length || pinned >= MAX_PINNED) return;
      const p = toLocal(event as PointerEvent);
      points.x.push(p.x);
      points.y.push(p.y);
      shade.push(Math.random());
      insert(triangles, points, points.x.length - 1);
      pinned++;
      report();
      schedule();
    };

    let resizeTimer = 0;
    const observer = new ResizeObserver(() => {
      const rect = host.getBoundingClientRect();
      if (Math.round(rect.width) === width && Math.abs(Math.round(rect.height) - height) < 120) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 180);
    });
    const themeObserver = new MutationObserver(() => {
      readColors();
      schedule();
    });

    readColors();
    build();
    observer.observe(host);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onLeave);
    host.addEventListener("click", onClick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      observer.disconnect();
      themeObserver.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onLeave);
      host.removeEventListener("click", onClick);
    };
  }, [left, right]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
