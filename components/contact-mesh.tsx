"use client";

import { useEffect, useRef } from "react";
import { cavity, triangulate, type Points, type Triangle } from "@/lib/delaunay";
import { mulberry32 } from "@/lib/rng";
import { watchPalette, type Palette } from "@/lib/canvas-palette";

/**
 * The contact section as a network. The canvas fills its parent with a
 * Delaunay mesh; every element marked `data-terminal` (the ways to reach me)
 * is a vertex of it, and so is the visitor's pointer. Each frame the shortest
 * paths from the pointer are found along the mesh: the whole tree is drawn
 * as a river system, the routes to the terminals in gold, and the closest terminal is
 * named in the element marked `data-path-readout`.
 */

type Terminal = { element: HTMLElement; link: HTMLElement | null; name: string; index: number };
type Link = { to: number; length: number; key: number };

const edgeKey = (u: number, v: number) => (u < v ? u * 65536 + v : v * 65536 + u);

export function ContactMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const readout = host.querySelector<HTMLElement>("[data-path-readout]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let palette: Palette = { fg: "0 0% 100%", bg: "0 0% 0%", gold: "42 45% 75%" };
    let width = 0, height = 0, dpr = 1;
    let points: Points = { x: [], y: [] };
    let triangles: Triangle[] = [];
    let count = 0; // points that are really in the mesh (the triangulation adds three helpers after them)
    let links: Link[][] = [];
    let edges: [number, number, number][] = [];
    let terminals: Terminal[] = [];
    let distance = new Float64Array(0);
    let previous = new Int32Array(0);
    let settled = new Uint8Array(0);
    let order = new Int32Array(0); // vertices in the order Dijkstra reached them, nearest first
    let weightOf = new Uint16Array(0); // how many vertices are routed through each one
    let frame = 0;
    let visible = false;
    let nearest = -1;
    let said = "";
    let mono = "monospace";
    // Where the paths start: the pointer when there is one, otherwise a point that wanders on its own.
    const source = { x: 0, y: 0 };
    let pointer: { x: number; y: number; touchedAt: number | null } | null = null;

    const build = () => {
      const rect = host.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      if (!width || !height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      mono = getComputedStyle(document.documentElement).getPropertyValue("--font-roboto-mono").split(",")[0].trim() || "monospace";

      const random = mulberry32(5501);
      const gap = Math.min(64, Math.max(42, width / 23));
      points = { x: [], y: [] };
      terminals = [...host.querySelectorAll<HTMLElement>("[data-terminal]")].map((element, index) => {
        const box = element.getBoundingClientRect();
        points.x.push(box.left + box.width / 2 - rect.left);
        points.y.push(box.top + box.height / 2 - rect.top);
        return { element, link: element.closest("a"), name: element.dataset.terminal ?? "", index };
      });
      // Scattered evenly, past the edges too, so the mesh runs off the section.
      const tries = Math.round(((width + 2 * gap) * (height + 2 * gap)) / (gap * gap)) * 26;
      for (let i = 0; i < tries; i++) {
        const x = -gap + random() * (width + 2 * gap);
        const y = -gap + random() * (height + 2 * gap);
        let free = true;
        for (let k = 0; k < points.x.length && free; k++) {
          if ((points.x[k] - x) ** 2 + (points.y[k] - y) ** 2 < gap * gap) free = false;
        }
        if (free) {
          points.x.push(x);
          points.y.push(y);
        }
      }
      count = points.x.length;
      triangles = triangulate(points);

      links = Array.from({ length: count }, () => []);
      const seen = new Set<number>();
      edges = [];
      for (const t of triangles) {
        for (const [u, v] of [[t.a, t.b], [t.b, t.c], [t.c, t.a]] as const) {
          if (u >= count || v >= count) continue;
          const key = edgeKey(u, v);
          if (seen.has(key)) continue;
          seen.add(key);
          const length = Math.hypot(points.x[u] - points.x[v], points.y[u] - points.y[v]);
          links[u].push({ to: v, length, key });
          links[v].push({ to: u, length, key });
          edges.push([u, v, key]);
        }
      }
      distance = new Float64Array(count);
      previous = new Int32Array(count);
      settled = new Uint8Array(count);
      order = new Int32Array(count);
      weightOf = new Uint16Array(count);
      if (!source.x && !source.y) {
        source.x = width * 0.5;
        source.y = height * 0.2;
      }
      requestDraw();
    };

    const draw = (now: number) => {
      frame = 0;
      if (!count) return;
      const t = now / 1000;
      const { fg, gold } = palette;

      if (pointer?.touchedAt && now - pointer.touchedAt > 3500) pointer = null;
      if (pointer) {
        source.x += (pointer.x - source.x) * 0.35;
        source.y += (pointer.y - source.y) * 0.35;
      } else if (!reduceMotion) {
        source.x += (width * (0.5 + 0.36 * Math.sin(t * 0.13)) - source.x) * 0.04;
        source.y += (height * (0.4 + 0.26 * Math.sin(t * 0.19 + 1.3)) - source.y) * 0.04;
      }

      // The source joins the mesh the way any new vertex would: the triangles whose
      // circumcircle holds it go, and it is joined to the rim of the hole they leave.
      const hole = cavity(triangles, source.x, source.y);
      const removed = new Set<number>();
      for (const i of hole.bad) {
        const tri = triangles[i];
        removed.add(edgeKey(tri.a, tri.b));
        removed.add(edgeKey(tri.b, tri.c));
        removed.add(edgeKey(tri.c, tri.a));
      }
      for (const [u, v] of hole.edges) removed.delete(edgeKey(u, v));

      // Dijkstra from the source, over the mesh's edges.
      distance.fill(Infinity);
      previous.fill(-1);
      settled.fill(0);
      const rim = new Set<number>();
      for (const [u, v] of hole.edges) {
        if (u < count) rim.add(u);
        if (v < count) rim.add(v);
      }
      for (const v of rim) {
        distance[v] = Math.hypot(points.x[v] - source.x, points.y[v] - source.y);
        previous[v] = -2;
      }
      let reached = 0;
      for (;;) {
        let u = -1;
        let best = Infinity;
        for (let i = 0; i < count; i++) {
          if (!settled[i] && distance[i] < best) {
            best = distance[i];
            u = i;
          }
        }
        if (u < 0) break;
        settled[u] = 1;
        order[reached++] = u;
        for (const link of links[u]) {
          if (removed.has(link.key)) continue;
          const through = best + link.length;
          if (through < distance[link.to]) {
            distance[link.to] = through;
            previous[link.to] = u;
          }
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // The mesh.
      ctx.beginPath();
      for (const [u, v, key] of edges) {
        if (removed.has(key)) continue;
        ctx.moveTo(points.x[u], points.y[u]);
        ctx.lineTo(points.x[v], points.y[v]);
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = `hsl(${fg} / 0.07)`;
      ctx.stroke();

      // The shortest-path tree, drawn like a river system: a branch is as heavy as
      // the number of vertices it leads to.
      weightOf.fill(1);
      for (let i = reached - 1; i >= 0; i--) {
        const v = order[i];
        if (previous[v] >= 0) weightOf[previous[v]] += weightOf[v];
      }
      for (let i = 0; i < reached; i++) {
        const v = order[i];
        const u = previous[v];
        if (u < 0) continue;
        const heft = Math.sqrt(weightOf[v] - 1);
        ctx.beginPath();
        ctx.moveTo(points.x[u], points.y[u]);
        ctx.lineTo(points.x[v], points.y[v]);
        ctx.lineWidth = Math.min(2.6, 0.8 + 0.2 * heft);
        ctx.strokeStyle = `hsl(${fg} / ${(0.1 + 0.34 * Math.min(1, heft / 8)).toFixed(3)})`;
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const v of rim) {
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(points.x[v], points.y[v]);
      }
      ctx.strokeStyle = `hsl(${gold} / 0.32)`;
      ctx.stroke();

      // The routes to each way of reaching me.
      let closest = -1;
      for (const terminal of terminals) {
        if (Number.isFinite(distance[terminal.index]) && (closest < 0 || distance[terminal.index] < distance[closest])) {
          closest = terminal.index;
        }
      }
      let hops = 0;
      for (const terminal of terminals) {
        if (!Number.isFinite(distance[terminal.index])) continue;
        const route: number[] = [terminal.index];
        while (previous[route[route.length - 1]] >= 0) route.push(previous[route[route.length - 1]]);
        route.reverse();
        const chosen = terminal.index === closest;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        for (const v of route) ctx.lineTo(points.x[v], points.y[v]);
        ctx.lineWidth = chosen ? 1.8 : 1.2;
        ctx.strokeStyle = `hsl(${gold} / ${chosen ? 1 : 0.5})`;
        ctx.stroke();

        const tx = points.x[terminal.index], ty = points.y[terminal.index];
        ctx.beginPath();
        ctx.arc(tx, ty, 7, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `hsl(${gold} / ${chosen ? 0.9 : 0.4})`;
        ctx.stroke();

        if (!chosen) continue;
        hops = route.length;
        if (reduceMotion) continue;
        const beat = (t * 0.7) % 1;
        ctx.beginPath();
        ctx.arc(tx, ty, 7 + beat * 14, 0, Math.PI * 2);
        ctx.strokeStyle = `hsl(${gold} / ${((1 - beat) * 0.6).toFixed(3)})`;
        ctx.stroke();
        // Signals running down the route.
        const total = distance[terminal.index];
        ctx.fillStyle = `hsl(${gold})`;
        for (let k = 0; k < 3; k++) {
          let along = (t * 150 + (k * total) / 3) % total;
          let fromX = source.x, fromY = source.y;
          for (const v of route) {
            const length = Math.hypot(points.x[v] - fromX, points.y[v] - fromY);
            if (along <= length) {
              const f = length ? along / length : 0;
              ctx.beginPath();
              ctx.arc(fromX + (points.x[v] - fromX) * f, fromY + (points.y[v] - fromY) * f, 2.3, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            along -= length;
            fromX = points.x[v];
            fromY = points.y[v];
          }
        }
      }

      // You.
      ctx.beginPath();
      ctx.arc(source.x, source.y, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${gold})`;
      ctx.fill();
      ctx.font = `10px ${mono}`;
      ctx.fillStyle = `hsl(${gold} / 0.9)`;
      ctx.fillText("YOU", source.x + 12, source.y - 10);

      if (closest !== nearest) {
        nearest = closest;
        for (const terminal of terminals) {
          if (terminal.link) terminal.link.dataset.nearest = String(terminal.index === closest);
        }
      }
      const name = terminals.find((terminal) => terminal.index === closest)?.name;
      const line = name ? `${name}: ${hops} ${hops === 1 ? "edge" : "edges"}` : "";
      if (readout && line !== said) {
        said = line;
        readout.textContent = line;
      }

      if (visible && !reduceMotion) frame = requestAnimationFrame(draw);
    };
    const requestDraw = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        touchedAt: event.pointerType === "mouse" ? null : performance.now(),
      };
      if (reduceMotion) {
        source.x = pointer.x;
        source.y = pointer.y;
      }
      requestDraw();
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === "mouse") pointer = null;
    };

    const stopPalette = watchPalette((next) => {
      palette = next;
      requestDraw();
    });
    const resize = new ResizeObserver(build);
    resize.observe(host);
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestDraw();
    });
    watcher.observe(host);
    host.addEventListener("pointermove", onPointer);
    host.addEventListener("pointerdown", onPointer);
    host.addEventListener("pointerleave", onLeave);
    build();
    // Web fonts move the terminals once they load.
    document.fonts?.ready.then(() => canvasRef.current && build());

    return () => {
      cancelAnimationFrame(frame);
      stopPalette();
      resize.disconnect();
      watcher.disconnect();
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerdown", onPointer);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block" aria-hidden="true" />;
}
