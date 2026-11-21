"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import { PrismFallback } from "@/components/prism-fallback";
import Image from "next/image";
import Link from "next/link";
import { projects, type ProjectDetail } from "@/lib/project-data";
import { powerCells, type Cell } from "@/lib/power-diagram";
import { mulberry32 } from "@/lib/rng";
import {
  hasProjectSignatureTransition,
  startProjectSignatureTransition,
} from "@/components/project-signature-transition";

const PrismShader = dynamic(
  () => import("@/components/prism-shader").then((module) => module.PrismShader),
  { ssr: false, loading: () => <PrismFallback /> },
);

type HoverPreview = NonNullable<ProjectDetail["hoverPreview"]>;

function HoverPreviewShot({
  preview,
  title,
  sizes,
}: {
  preview: HoverPreview;
  title: string;
  sizes: string;
}) {
  const fitClass = preview.fit === "contain" ? "object-contain" : "object-cover";
  const deviceShotClass = preview.device === "browser" || preview.device === "float" ? "" : "device-shot";
  const className = `${deviceShotClass} ${fitClass}`.trim();
  const style = preview.objectPosition
    ? { objectPosition: preview.objectPosition }
    : undefined;

  return (
    <>
      <Image
        src={preview.src}
        alt={`${title} app screenshot`}
        fill
        sizes={sizes}
        className={preview.darkSrc ? `${className} dark:hidden` : className}
        style={style}
      />
      {preview.darkSrc && (
        <Image
          src={preview.darkSrc}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          className={`${className} hidden dark:block`}
          style={style}
        />
      )}
    </>
  );
}

function ProjectDevice({ project }: { project: ProjectDetail }) {
  const preview = project.hoverPreview ?? {
    device: "mac",
    src: project.image,
    fit: "cover",
  } satisfies HoverPreview;

  if (preview.device === "float") {
    return (
      <div
        className="relative w-[320px] drop-shadow-[0_28px_44px_rgba(18,22,31,0.24)] md:w-[380px] dark:drop-shadow-[0_30px_52px_rgba(0,0,0,0.6)]"
        style={{ aspectRatio: preview.aspectRatio }}
      >
        <HoverPreviewShot preview={{ ...preview, fit: "contain" }} title={project.title} sizes="(min-width: 1024px) 580px, 380px" />
      </div>
    );
  }

  if (preview.device === "tv") {
    return <div className="gallery-card-preview"><div><HoverPreviewShot preview={preview} title={project.title} sizes="(min-width: 1024px) 580px, 420px" /></div></div>;
  }

  if (preview.device === "watch") {
    return <div className="bike-card-preview"><div className="bike-watch"><div className="bike-watch-screen relative aspect-[416/496]"><HoverPreviewShot preview={preview} title={project.title} sizes="290px" /></div><span className="bike-watch-crown" aria-hidden="true" /></div></div>;
  }

  if (preview.device === "iphone") {
    return (
      <div className="w-[150px] md:w-[174px] drop-shadow-[0_34px_60px_rgba(18,22,31,0.28)] dark:drop-shadow-[0_34px_70px_rgba(0,0,0,0.6)]">
        <div className="device-frame device-frame-phone relative rounded-[34px] p-[5px] md:rounded-[40px] md:p-[6px]">
          <span
            className="absolute left-1/2 top-[11px] z-20 h-[16px] w-[56px] -translate-x-1/2 rounded-full bg-[#050505] shadow-[0_1px_0_rgba(255,255,255,0.10)] md:top-[13px] md:h-[19px] md:w-[66px]"
            aria-hidden
          />
          <div className="device-screen relative aspect-[383/818] overflow-hidden rounded-[29px] md:rounded-[34px]">
            <HoverPreviewShot preview={preview} title={project.title} sizes="270px" />
          </div>
        </div>
      </div>
    );
  }

  if (preview.device === "browser") {
    return (
      <div className="w-[340px] overflow-hidden rounded-[13px] border border-[hsl(var(--border))] bg-card shadow-[0_34px_72px_-34px_rgba(18,22,31,0.38)] md:w-[430px] dark:shadow-[0_34px_76px_-30px_rgba(0,0,0,0.72)]">
        <div className="flex h-8 items-center gap-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#fc625d]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#fdbc40]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#35cd4b]" />
          <div className="ml-2 h-4 flex-1 rounded-full border border-[hsl(var(--border))] bg-foreground/[0.03]" />
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[hsl(var(--foreground-subtle))]">
            Gmail
          </span>
        </div>
        <div
          className="relative bg-white dark:bg-[#111112]"
          style={{ aspectRatio: preview.aspectRatio ?? "742 / 273" }}
        >
          <HoverPreviewShot preview={preview} title={project.title} sizes="(min-width: 1024px) 580px, 430px" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[310px] md:w-[380px] drop-shadow-[0_34px_60px_rgba(18,22,31,0.25)] dark:drop-shadow-[0_34px_70px_rgba(0,0,0,0.62)]">
      <div className="device-frame device-frame-mac relative rounded-[16px] p-[6px] md:rounded-[20px] md:p-[8px]">
        <div className="device-screen relative aspect-[294/183] overflow-hidden rounded-[10px] md:rounded-[13px]">
          <HoverPreviewShot preview={preview} title={project.title} sizes="(min-width: 1024px) 580px, 380px" />
          <div
            className="absolute left-1/2 top-0 z-20 h-[10px] w-[15%] min-w-[58px] max-w-[92px] -translate-x-1/2 rounded-b-[8px] bg-[#09090a] shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)] md:h-[13px]"
            aria-hidden
          >
            <span className="absolute left-1/2 top-[4px] h-[2px] w-[2px] -translate-x-1/2 rounded-full bg-white/25 md:top-[5px]" />
          </div>
        </div>
      </div>
      <div className="macbook-base relative mx-auto -mt-px h-[10px] w-full rounded-b-[12px] md:h-[12px] md:rounded-b-[14px]">
        <div className="macbook-base-indent absolute left-1/2 top-0 h-[4px] w-[18%] max-w-[104px] -translate-x-1/2 rounded-b-[7px] md:h-[5px]" />
      </div>
    </div>
  );
}

const EASE = [0.55, 0.45, 0.16, 1] as const;

function SectionTitle() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="flex items-center" aria-hidden="true">
      <motion.span
        initial={{ opacity: 0, x: -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
        transition={{ duration: 1, ease: EASE }}
        className="text-section font-light text-foreground"
      >
        WO
      </motion.span>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        className="mx-2 flex flex-col items-center md:mx-4"
      >
        <span className="arabic-bracket text-lg md:text-xl">「</span>
        <span className="font-arabic text-xl text-[hsl(var(--gold))] md:text-3xl">أعمال</span>
        <span className="arabic-bracket text-lg md:text-xl">」</span>
      </motion.div>
      <motion.span
        initial={{ opacity: 0, x: 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
        transition={{ duration: 1, ease: EASE }}
        className="text-section font-light text-foreground"
      >
        RK
      </motion.span>
    </div>
  );
}

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/**
 * The projects as a power diagram: every project owns the part of the frame
 * nearest to it. Pointing at one gives it more weight, so its cell grows and
 * the others make room.
 */
function WorkCells() {
  const hostRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<number | null>(null);
  const kick = useRef<() => void>(() => {});
  // The cell a touch has just landed on while it was still closed.
  const tapOpens = useRef<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  const activate = (index: number | null) => {
    if (activeRef.current === index) return;
    activeRef.current = index;
    setActive(index);
    kick.current();
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const cells = [...host.querySelectorAll<HTMLElement>("[data-cell]")];
    const media = cells.map((cell) => cell.querySelector<HTMLElement>("[data-media]")!);
    const labels = cells.map((cell) => cell.querySelector<HTMLElement>("[data-label]")!);
    const outlines = [...host.querySelectorAll<SVGPolygonElement>("[data-outline]")];
    const activeOutline = host.querySelector<SVGPolygonElement>("[data-active-outline]")!;
    const count = cells.length;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const random = mulberry32(31);
    const px = cells.map(() => 0);
    const py = cells.map(() => 0);
    const weight = cells.map(() => 0);
    const glow = cells.map(() => 0);
    const phase = cells.map(() => random() * Math.PI * 2);
    const jitter = cells.map(() => [random() - 0.5, random() - 0.5]);
    const natural = cells.map(() => ({ width: 1, height: 1 }));
    let width = 0, height = 0;
    let frame = 0, last = 0;
    let visible = false, placed = false;
    let result: Cell[] = [];

    /** Moves weights towards the areas each cell should have, and sites towards the middle of their cells. */
    const step = (t: number, rate: number) => {
      result = powerCells(px, py, weight, width, height);
      const chosen = activeRef.current;
      const share = cells.map((_, i) =>
        chosen === null ? 1 + (reduceMotion ? 0 : 0.2 * Math.sin(t * 0.4 + phase[i])) : i === chosen ? 1 : 0,
      );
      if (chosen !== null) {
        const big = width < 640 ? 0.4 : 0.38;
        share.forEach((_, i) => (share[i] = i === chosen ? big : (1 - big) / (count - 1)));
      }
      const total = share.reduce((sum, value) => sum + value, 0);
      const cap = 14 * Math.sqrt((width * height) / count) * rate;
      let mean = 0;
      for (let i = 0; i < count; i++) {
        const cell = result[i];
        const wanted = (share[i] / total) * width * height;
        weight[i] += Math.min(cap, Math.max(-cap, 0.12 * rate * (wanted - cell.area)));
        mean += weight[i] / count;
        if (cell.area > 0) {
          px[i] += (cell.x - px[i]) * Math.min(1, 0.07 * rate);
          py[i] += (cell.y - py[i]) * Math.min(1, 0.07 * rate);
        }
      }
      for (let i = 0; i < count; i++) weight[i] -= mean;
    };

    const render = () => {
      for (let i = 0; i < count; i++) {
        const cell = result[i];
        const element = cells[i];
        if (cell.polygon.length < 6) {
          element.style.clipPath = "polygon(0 0, 0 0, 0 0)";
          outlines[i].setAttribute("points", "");
          continue;
        }
        const corners: string[] = [];
        for (let k = 0; k < cell.polygon.length; k += 2) {
          corners.push(`${cell.polygon[k].toFixed(1)}px ${cell.polygon[k + 1].toFixed(1)}px`);
        }
        element.style.clipPath = `polygon(${corners.join(",")})`;
        const points = cell.polygon.map((value) => value.toFixed(1)).join(" ");
        outlines[i].setAttribute("points", points);
        if (activeRef.current === i) activeOutline.setAttribute("points", points);

        // Idle, the device nearly fills the cell; chosen, it moves up to leave room for the write-up.
        const a = glow[i];
        const r = cell.radius;
        const size = natural[i];
        const scale = Math.min(
          (lerp(0.84, 0.6, a) * r) / (0.5 * Math.hypot(size.width, size.height)),
          (lerp(0.54, 0.38, a) * r) / (size.height / 2),
        );
        const middle = cell.y + lerp(-0.12, -0.46, a) * r;
        media[i].style.transform = `translate(${cell.x.toFixed(1)}px, ${middle.toFixed(1)}px) translate(-50%, -50%) scale(${scale.toFixed(4)})`;
        labels[i].style.transform = `translate(${cell.x.toFixed(1)}px, ${(middle + (scale * size.height) / 2 + 0.08 * r).toFixed(1)}px) translateX(-50%)`;
        labels[i].style.width = `${(lerp(1.5, 1.62, a) * r).toFixed(1)}px`;
        // Too small for more than a name.
        labels[i].dataset.compact = String(r < 72);
        element.style.setProperty("--a", a.toFixed(3));
        element.style.setProperty("--cx", `${cell.x.toFixed(1)}px`);
        element.style.setProperty("--cy", `${cell.y.toFixed(1)}px`);
        element.style.setProperty("--r", `${r.toFixed(1)}px`);
      }
      if (activeRef.current === null) activeOutline.setAttribute("points", "");
    };

    const settle = () => {
      for (let i = 0; i < 260; i++) step(0, 1);
      glow.forEach((_, i) => (glow[i] = activeRef.current === i ? 1 : 0));
      render();
    };

    const tick = (now: number) => {
      frame = 0;
      if (!placed) return;
      const rate = Math.min(3, last ? (now - last) / (1000 / 60) : 1);
      last = now;
      step(now / 1000, rate);
      for (let i = 0; i < count; i++) {
        glow[i] += ((activeRef.current === i ? 1 : 0) - glow[i]) * Math.min(1, 0.13 * rate);
      }
      render();
      if (visible) frame = requestAnimationFrame(tick);
    };

    const measure = () => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      media.forEach((element, i) => {
        natural[i] = { width: element.offsetWidth || 1, height: element.offsetHeight || 1 };
      });
      if (placed) {
        for (let i = 0; i < count; i++) {
          px[i] *= rect.width / width;
          py[i] *= rect.height / height;
          weight[i] *= (rect.width * rect.height) / (width * height);
        }
      } else {
        const columns = rect.width >= 900 ? 4 : rect.width >= 560 ? 3 : 2;
        const rows = Math.ceil(count / columns);
        for (let i = 0; i < count; i++) {
          px[i] = ((i % columns) + 0.5 + jitter[i][0] * 0.5) * (rect.width / columns);
          py[i] = (Math.floor(i / columns) + 0.5 + jitter[i][1] * 0.5) * (rect.height / rows);
        }
      }
      width = rect.width;
      height = rect.height;
      placed = true;
      settle();
      setReady(true);
    };

    kick.current = () => {
      if (reduceMotion) settle();
    };

    const resize = new ResizeObserver(measure);
    resize.observe(host);
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !reduceMotion;
      last = 0;
      if (visible && !frame) frame = requestAnimationFrame(tick);
    });
    watcher.observe(host);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      watcher.disconnect();
      kick.current = () => {};
    };
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, project: ProjectDetail, index: number) => {
    // By touch, the first tap opens the cell and the second follows the link.
    if (tapOpens.current === index) {
      tapOpens.current = null;
      event.preventDefault();
      activate(index);
      return;
    }
    const isModifiedNavigation = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (isModifiedNavigation || !hasProjectSignatureTransition(project.id)) return;
    event.preventDefault();
    startProjectSignatureTransition(project.id, `/projects/${project.id}`);
  };

  return (
    <div className="mt-16 md:mt-24">
      <div
        ref={hostRef}
        className="work-cells"
        data-ready={ready}
        onPointerLeave={(event) => event.pointerType === "mouse" && activate(null)}
        onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && activate(null)}
      >
        {projects.map((project, index) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            data-cell
            data-active={active === index}
            className="work-cell"
            onClick={(event) => handleClick(event, project, index)}
            onPointerEnter={(event) => event.pointerType === "mouse" && activate(index)}
            onPointerDown={(event) => {
              tapOpens.current = event.pointerType !== "mouse" && activeRef.current !== index ? index : null;
            }}
            onFocus={() => activate(index)}
          >
            <div data-media className="work-cell-media" data-guide-skip aria-hidden="true">
              <ProjectDevice project={project} />
            </div>
            <div data-label className="work-cell-label">
              <span className="work-cell-index">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="work-cell-title">{project.title}</h3>
              <p className="work-cell-category">{project.category}</p>
              <div className="work-cell-more">
                <p className="work-cell-description">{project.description[0]}</p>
                <p className="work-cell-stack">{project.technologies.slice(0, 4).join(" · ")}</p>
                <span className="work-cell-open">
                  Open case study
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>
        ))}
        <svg className="work-cells-lines" aria-hidden="true">
          {projects.map((project) => (
            <polygon key={project.id} data-outline />
          ))}
          <polygon data-active-outline />
        </svg>
      </div>

      <p
        className="mt-5 max-w-md font-mono text-[11px] leading-relaxed text-[hsl(var(--foreground-subtle))]"
        data-guide-skip
      >
        <span className="text-[hsl(var(--foreground-muted))]">A power diagram of {projects.length} projects.</span>{" "}
        Each one owns the part of the frame nearest to it. Point at a project to give it more weight.
      </p>
    </div>
  );
}

export function Projects() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const shouldLoadPrism = useInView(sectionRef, { once: true, margin: "300px" });

  return (
    <section ref={sectionRef} id="work" className="relative overflow-x-clip bg-background py-16 md:py-24 noise-bg">
      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-2 lg:gap-24">
          {/* Interactive vGPU prism */}
          <div className="relative z-0">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.985 }}
              transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative -mx-6 h-[19rem] w-[calc(100%+3rem)] md:-mx-12 md:h-[24rem] md:w-[calc(100%+6rem)] lg:-ml-20 lg:-mr-36 lg:h-[25rem] lg:w-[calc(100%+14rem)]"
            >
              {shouldLoadPrism ? <PrismShader /> : <PrismFallback />}
            </motion.div>
          </div>

          {/* Title and intro */}
          <div className="relative z-10 lg:pb-10">
            <SectionTitle />
            <h2 className="sr-only">Selected work</h2>
            <div className="mt-10 max-w-md">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-condensed text-2xl uppercase text-foreground md:text-3xl">QUIETLY</span>
                <span className="font-script text-3xl text-[hsl(var(--gold))] md:text-4xl">powerful</span>
              </div>
              <span className="block font-condensed text-2xl uppercase text-foreground md:text-3xl">
                DIGITAL EXPERIENCES
              </span>
              <p className="mt-6 font-mono text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                Engineering is a bridge between logic and creativity. My goal is to
                build solutions that are not just functional, but elegant, quietly
                threading innovation into every line of code.
              </p>
            </div>
          </div>
        </div>

        <WorkCells />

        <div className="mt-10 flex items-center justify-between">
          <span className="bracket-label">Fueled by curiosity, shaped by code</span>
          <span className="bracket-label">YC © {new Date().getFullYear()}</span>
        </div>
      </div>
    </section>
  );
}
