"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import { PrismFallback } from "@/components/prism-fallback";
import Image from "next/image";
import Link from "next/link";
import { projects, type ProjectDetail } from "@/lib/project-data";
import {
  getProjectSignature,
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

const NEUTRAL_CARD = { bg: "hsl(var(--card))", fg: "hsl(var(--foreground))", accent: "hsl(var(--gold))", font: "inherit" };

/** Scales a device mock-up to fill the given shares of the box it sits in. */
function fitDevice(box: HTMLElement, device: HTMLElement, fill: { wide: number; tall: number }) {
  const inner = device.firstElementChild as HTMLElement;
  const scale = Math.min(
    (box.offsetWidth * fill.wide) / (inner.offsetWidth || 1),
    (box.offsetHeight * fill.tall) / (inner.offsetHeight || 1),
  );
  device.style.setProperty("--scale", scale.toFixed(4));
}

/** A project's name, colours and typeface (the ones its case study opens on), as CSS variables. */
function projectLook(project: ProjectDetail) {
  const signature = getProjectSignature(project.id);
  const look = signature ?? NEUTRAL_CARD;
  return {
    title: signature?.title ?? project.title,
    style: {
      "--card-bg": look.bg,
      "--card-fg": look.fg,
      "--card-accent": look.accent,
      "--card-font": look.font,
    } as React.CSSProperties,
  };
}

/** Opens a case study through its signature transition, unless the click is meant for a new tab. */
function openProject(event: React.MouseEvent<HTMLAnchorElement>, project: ProjectDetail) {
  const isModifiedNavigation = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  if (isModifiedNavigation || !hasProjectSignatureTransition(project.id)) return;
  event.preventDefault();
  startProjectSignatureTransition(project.id, `/projects/${project.id}`);
}

/**
 * The projects as an index of names, each set in its own typeface. Pointing
 * at a row floods it with the project's colour and brings its screen up
 * beside the pointer.
 */
function WorkIndex() {
  const listRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const list = listRef.current;
    const float = floatRef.current;
    if (!list || !float) return;
    const tiles = [...float.querySelectorAll<HTMLElement>("[data-tile]")];
    const fit = () =>
      tiles.forEach((tile) => fitDevice(tile, tile.querySelector<HTMLElement>("[data-device]")!, { wide: 0.8, tall: 0.76 }));
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(float);

    // The preview trails the pointer.
    let frame = 0;
    let x = 0, y = 0, tx = 0, ty = 0;
    let placed = false;
    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      float.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = list.getBoundingClientRect();
      // Keep it on the side of the pointer that has room.
      const side = event.clientX > window.innerWidth * 0.62 ? -float.offsetWidth - 28 : 28;
      tx = event.clientX - rect.left + side;
      ty = event.clientY - rect.top - float.offsetHeight / 2;
      if (!placed) {
        placed = true;
        x = tx;
        y = ty;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };
    list.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      list.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="container mx-auto px-6 md:px-12">
      <div ref={listRef} className="work-index" onPointerLeave={() => setActive(null)}>
        {projects.map((project, index) => {
          const look = projectLook(project);
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="work-index-row"
              style={look.style}
              data-active={active === index ? "" : undefined}
              onClick={(event) => openProject(event, project)}
              onPointerEnter={(event) => event.pointerType === "mouse" && setActive(index)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
            >
              <span className="work-index-number">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="work-index-title">{look.title}</h3>
              <span className="work-index-meta">
                <span>{project.category}</span>
                {project.timeline && project.timeline !== "Recent" && <span>{project.timeline}</span>}
              </span>
              <span className="work-index-arrow">
                <ArrowUpRight aria-hidden="true" />
              </span>
            </Link>
          );
        })}

        {/* The screen of whichever project is pointed at */}
        <div ref={floatRef} className="work-index-float" data-show={active !== null ? "" : undefined} data-guide-skip aria-hidden="true">
          {projects.map((project, index) => (
            <div
              key={project.id}
              data-tile
              className="work-index-tile"
              data-on={active === index ? "" : undefined}
              style={projectLook(project).style}
            >
              <div data-device={project.hoverPreview?.device ?? "mac"} className="work-index-device">
                <div>
                  <ProjectDevice project={project} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

      </div>

      <div className="mt-14">
        <WorkIndex />
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <div className="mt-10 flex items-center justify-between">
          <span className="bracket-label">Fueled by curiosity, shaped by code</span>
          <span className="bracket-label">YC © {new Date().getFullYear()}</span>
        </div>
      </div>
    </section>
  );
}
