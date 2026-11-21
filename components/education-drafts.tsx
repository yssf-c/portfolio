"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { degrees, type Degree } from "@/lib/profile-data";

/** Two other layouts for the Education section, offered beside the timeline. */

const msc = degrees.find((degree) => degree.id === "msc")!;
const basc = degrees.find((degree) => degree.id === "basc")!;
const EASE = [0.16, 1, 0.3, 1] as const;

/** A card that leans towards the pointer and catches a highlight where it is. */
function TiltCard({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const move = (event: React.PointerEvent) => {
    const card = ref.current;
    if (!card || event.pointerType !== "mouse") return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--rx", `${((0.5 - y) * 7).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${((x - 0.5) * 9).toFixed(2)}deg`);
    card.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    card.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
    card.dataset.lit = "";
  };
  const leave = () => {
    const card = ref.current;
    if (!card) return;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    delete card.dataset.lit;
  };
  return (
    <article ref={ref} className={`edu-card ${className}`} onPointerMove={move} onPointerLeave={leave}>
      <span className="edu-card-glare" aria-hidden="true" />
      {children}
    </article>
  );
}

/** The two degrees as a pair of diplomas. */
export function EducationCards({ progress }: { progress: number }) {
  const percent = Math.round(progress * 100);
  return (
    <motion.div
      className="edu-cards"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <TiltCard className="edu-card-ink">
        <header className="edu-card-top">
          <span className="edu-card-chip">
            <span className="edu-card-dot" />
            In progress · {percent}%
          </span>
          <span>{msc.period}</span>
        </header>
        <p className="edu-card-short" aria-hidden="true">
          {msc.short}
        </p>
        <h3 className="edu-card-title">
          {msc.title[0]} <em>{msc.title[1]}</em>
        </h3>
        <p className="edu-card-thesis">
          <span>Thesis</span>
          {msc.thesis}
        </p>
        <dl className="edu-card-facts">
          <div>
            <dt>Supervisor</dt>
            <dd>{msc.supervisor}</dd>
          </div>
          <div>
            <dt>Funding</dt>
            <dd>
              {msc.funding?.amount} <small>{msc.funding?.label}</small>
            </dd>
          </div>
          <div>
            <dt>Institution</dt>
            <dd>{msc.institution}</dd>
          </div>
        </dl>
        <div className="edu-card-progress" aria-hidden="true">
          <span style={{ "--progress": progress } as CSSProperties} />
        </div>
      </TiltCard>

      <TiltCard className="edu-card-paper">
        <header className="edu-card-top">
          <span className="edu-card-chip">Conferred</span>
          <span>{basc.period}</span>
        </header>
        <p className="edu-card-short" aria-hidden="true">
          {basc.short}
        </p>
        <h3 className="edu-card-title">
          {basc.title[0]} {basc.title[1]}, <em>{basc.field}</em>
        </h3>
        <dl className="edu-card-facts">
          <div>
            <dt>GPA</dt>
            <dd>{basc.gpa}</dd>
          </div>
          <div>
            <dt>Institution</dt>
            <dd>{basc.institution}</dd>
          </div>
        </dl>
        <ul className="edu-card-courses">
          {basc.coursework?.map((course) => <li key={course.name}>{course.name}</li>)}
        </ul>
      </TiltCard>
    </motion.div>
  );
}

function facts(degree: Degree): { label: string; value: string }[] {
  return [
    { label: "Institution", value: degree.institution },
    { label: "Status", value: degree.status },
    ...(degree.supervisor ? [{ label: "Supervisor", value: degree.supervisor }] : []),
    ...(degree.funding ? [{ label: "Funding", value: `${degree.funding.amount} ${degree.funding.label}` }] : []),
    ...(degree.gpa ? [{ label: "GPA", value: degree.gpa }] : []),
  ];
}

/** The two degrees as oversized index rows; a row opens to show what is in it. */
export function EducationRows() {
  const [open, setOpen] = useState<Degree["id"] | null>("msc");
  return (
    <motion.div
      className="edu-rows"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {[msc, basc].map((degree, index) => {
        const isOpen = open === degree.id;
        return (
          <div key={degree.id} className="edu-row" data-open={isOpen ? "" : undefined}>
            <h3>
              <button
                type="button"
                className="edu-row-head"
                aria-expanded={isOpen}
                aria-controls={`edu-row-${degree.id}`}
                onClick={() => setOpen(isOpen ? null : degree.id)}
              >
                <span className="edu-row-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="edu-row-title">
                  {degree.title[0]}{" "}
                  <em>{degree.title[1]}</em>
                </span>
                <span className="edu-row-period">
                  {degree.start[0]} — {degree.end[0] - 1}
                </span>
                <span className="edu-row-plus">
                  <Plus aria-hidden="true" />
                </span>
              </button>
            </h3>
            <div id={`edu-row-${degree.id}`} className="edu-row-body" inert={!isOpen}>
              <div>
                <div className="edu-row-inner">
                  <div className="edu-row-lead">
                    {degree.thesis ? (
                      <>
                        <span>Thesis</span>
                        <p>{degree.thesis}</p>
                      </>
                    ) : (
                      <>
                        <span>{degree.field}</span>
                        <ul>
                          {degree.coursework?.map((course) => <li key={course.name}>{course.name}</li>)}
                        </ul>
                      </>
                    )}
                  </div>
                  <dl className="edu-row-facts">
                    {facts(degree).map((fact) => (
                      <div key={fact.label}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
