"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * A liquid-glass surface: a frosted, tinted body whose edge bends the page
 * behind it, as through the bevel of a lens, under a bright rim. The bend is
 * an SVG displacement map drawn to the surface's own size, and the frosted
 * body fades out over it through a mask drawn the same way, so there is no
 * seam between the two. Only Chromium applies SVG filters to a backdrop;
 * elsewhere the surface is frosted edge to edge (see `.glass-edge`).
 */

/** How far, in CSS pixels, the backdrop is pulled inward at the very edge. */
const BEND = 22;

type Map = { href: string; mask: string; width: number; height: number };

/** The displacement map, and the mask that fades the frosted body out towards the edge. */
function drawMap(width: number, height: number, bevel: number): { href: string; mask: string } | null {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const image = ctx.createImageData(width, height);
  const fade = ctx.createImageData(width, height);
  const radius = Math.min(width, height) / 2;
  const halfW = width / 2 - radius, halfH = height / 2 - radius;
  for (let j = 0; j < height; j++)
    for (let i = 0; i < width; i++) {
      // Signed distance to the rounded outline, and the outward normal there.
      const px = i + 0.5 - width / 2, py = j + 0.5 - height / 2;
      const qx = Math.abs(px) - halfW, qy = Math.abs(py) - halfH;
      const ox = Math.max(qx, 0), oy = Math.max(qy, 0);
      const outside = Math.hypot(ox, oy);
      const depth = radius - outside - Math.min(Math.max(qx, qy), 0);
      let nx = 0, ny = 0;
      if (outside > 0) {
        nx = (ox / outside) * Math.sign(px);
        ny = (oy / outside) * Math.sign(py);
      } else if (qx > qy) nx = Math.sign(px);
      else ny = Math.sign(py);
      // The slope of a rounded bevel: steep at the edge, flat by `bevel` pixels in.
      const t = Math.min(1, Math.max(0, 1 - depth / bevel));
      const bend = 1 - Math.sqrt(1 - t * t);
      const k = (j * width + i) * 4;
      image.data[k] = Math.round(127.5 - nx * bend * 127.5);
      image.data[k + 1] = Math.round(127.5 - ny * bend * 127.5);
      image.data[k + 2] = 128;
      image.data[k + 3] = 255;
      // Frost: none in the outer third of the bevel, full a little past it.
      const f = Math.min(1, Math.max(0, (depth - bevel * 0.3) / (bevel * 0.9)));
      fade.data[k + 3] = Math.round(f * f * (3 - 2 * f) * 255);
    }
  ctx.putImageData(image, 0, 0);
  const href = canvas.toDataURL();
  ctx.putImageData(fade, 0, 0);
  return { href, mask: canvas.toDataURL() };
}

type Props = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Glass({ className = "", style, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = `glass-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // WebKit and Gecko accept the syntax but do not bend the backdrop.
    const chromium = /Chrome\/|Chromium\//.test(navigator.userAgent) && !/Edg\/1[0-7]\./.test(navigator.userAgent);
    if (!chromium || window.matchMedia("(prefers-reduced-transparency: reduce)").matches) return;

    let timer = 0;
    const build = () => {
      const width = element.offsetWidth, height = element.offsetHeight;
      if (!width || !height) return;
      const bevel = parseFloat(getComputedStyle(element).getPropertyValue("--glass-bevel")) || 12;
      const drawn = drawMap(width, height, bevel);
      if (drawn) setMap({ ...drawn, width, height });
    };
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 80);
    });
    build();
    observer.observe(element);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`glass-pill ${className}`}
      data-refract={map ? "" : undefined}
      style={
        map
          ? ({ ...style, "--glass-refract": `url(#${id})`, "--glass-mask": `url("${map.mask}")` } as CSSProperties)
          : style
      }
    >
      {map && (
        <svg className="glass-defs" width="0" height="0" aria-hidden="true">
          <filter
            id={id}
            x="0"
            y="0"
            width={map.width}
            height={map.height}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feImage href={map.href} x="0" y="0" width={map.width} height={map.height} preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={BEND * 2} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      <span className="glass-edge" aria-hidden="true" />
      <span className="glass-body" aria-hidden="true" />
      <span className="glass-rim" aria-hidden="true" />
      {children}
    </div>
  );
}
