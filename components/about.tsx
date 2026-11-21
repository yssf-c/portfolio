"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { degrees, roles } from "@/lib/profile-data";

const EASE = [0.55, 0.45, 0.16, 1] as const;
const RISE = [0.16, 1, 0.3, 1] as const;

const STATEMENT =
  "I’m slowly chipping the iceberg of knowledge, hoping to make a big enough dent to make my younger self proud.";

const currentRoles = roles.filter((role) => role.end === null);
const msc = degrees.find((degree) => degree.id === "msc")!;

/** The statement arrives a word at a time, each rising out of its own line. */
function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-12% 0px" });
  const reduceMotion = useReducedMotion();

  return (
    <p ref={ref} className="about-statement" aria-label={STATEMENT}>
      {STATEMENT.split(" ").map((word, index) => (
        <span key={index} className="about-word" aria-hidden="true">
          <motion.span
            initial={reduceMotion ? false : { y: "110%" }}
            animate={isInView || reduceMotion ? { y: 0 } : { y: "110%" }}
            transition={{ duration: 0.9, delay: index * 0.028, ease: RISE }}
          >
            {word}
          </motion.span>{" "}
        </span>
      ))}
    </p>
  );
}

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });

  // The name is written in as the section is read: --ink runs from 0 to 1 over the scroll through it.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const height = window.innerHeight;
      const progress = (height * 0.72 - rect.top) / Math.max(1, rect.height - height * 0.5);
      section.style.setProperty("--ink", Math.min(1, Math.max(0, progress)).toFixed(4));
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
    <section ref={sectionRef} id="about" className="about relative">
      <div className="container relative mx-auto px-6 md:px-12">
        <div className="grid gap-x-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] xl:gap-x-24">
          {/* يوسف شواي, written in gold as the page scrolls */}
          <div className="about-name-stage" data-guide-skip aria-hidden="true">
            <div className="about-name">
              <span className="about-name-ghost">
                <span>يوسف</span>
                <span>شواي</span>
              </span>
              <span className="about-name-ink">
                <span>يوسف</span>
                <span>شواي</span>
              </span>
            </div>
          </div>

          <div className="about-copy">
            {/* IN「معلومات」FO */}
            <div ref={titleRef} className="flex items-center" aria-hidden="true">
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

            <Statement />

            <div className="max-w-xl space-y-6 text-lg leading-relaxed text-[hsl(var(--foreground-soft))]">
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

            <dl className="about-facts">
              <div>
                <dt>Now</dt>
                <dd>
                  {currentRoles.map((role) => (
                    <span key={role.id} className="block">
                      {role.role}, <span className="text-[hsl(var(--foreground-muted))]">{role.company}</span>
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt>Studying</dt>
                <dd>
                  {msc.short} {msc.field}, <span className="text-[hsl(var(--foreground-muted))]">{msc.institution}</span>
                </dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>Ottawa, Canada</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
