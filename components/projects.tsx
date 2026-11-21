"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import { PrismFallback } from "@/components/prism-fallback";
import Image from "next/image";
import Link from "next/link";
import { projects, type ProjectDetail } from "@/lib/project-data";
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

// How much each device is enlarged on its plate (desktop only).
const DEVICE_ZOOM: Record<HoverPreview["device"], number> = {
  mac: 1.5,
  browser: 1.3,
  tv: 1.32,
  float: 1.4,
  iphone: 1.3,
  watch: 1.3,
};

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

function Plate({ project, index }: { project: ProjectDetail; index: number }) {
  const device = project.hoverPreview?.device ?? "mac";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isModifiedNavigation = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
    if (isModifiedNavigation || !hasProjectSignatureTransition(project.id)) return;
    e.preventDefault();
    startProjectSignatureTransition(project.id, `/projects/${project.id}`);
  };

  return (
    <li className="work-plate" style={{ "--n": index } as React.CSSProperties}>
      <Link href={`/projects/${project.id}`} onClick={handleClick} className="work-plate-link group">
        <div className="work-plate-text">
          <div className="flex items-baseline justify-between gap-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--foreground-muted))]">
            <span>{project.category}</span>
            {project.timeline && project.timeline !== "Recent" && (
              <span className="shrink-0 text-[hsl(var(--foreground-subtle))]">{project.timeline}</span>
            )}
          </div>

          <div>
            <h3 className="work-plate-title">{project.title}</h3>
            <p className="mt-5 max-w-[34rem] text-[15px] leading-relaxed text-[hsl(var(--foreground-soft))] md:text-base">
              {project.description[0]}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Built with">
              {project.technologies.slice(0, 5).map((technology) => (
                <li
                  key={technology}
                  className="border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--foreground-soft))]"
                >
                  {technology}
                </li>
              ))}
            </ul>
          </div>

          <span className="work-plate-open">
            Open case study
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </div>

        <div className="work-plate-stage" data-guide-skip>
          <div
            className="work-plate-device"
            style={{ "--zoom": DEVICE_ZOOM[device] } as React.CSSProperties}
          >
            <ProjectDevice project={project} />
          </div>
        </div>
      </Link>
    </li>
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

        {/* One plate per project; each slides over the last */}
        <ol className="work-plates">
          {projects.map((project, index) => (
            <Plate key={project.id} project={project} index={index} />
          ))}
        </ol>

        <div className="mt-10 flex items-center justify-between">
          <span className="bracket-label">Fueled by curiosity, shaped by code</span>
          <span className="bracket-label">YC © {new Date().getFullYear()}</span>
        </div>
      </div>
    </section>
  );
}
