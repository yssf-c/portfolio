"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { degrees, type Degree } from "@/lib/profile-data";
import { ThesisFigure } from "@/components/thesis-figure";

/** Other layouts for the Education section, offered beside the timeline. */

const msc = degrees.find((degree) => degree.id === "msc")!;
const basc = degrees.find((degree) => degree.id === "basc")!;
const EASE = [0.16, 1, 0.3, 1] as const;

/** A sheet that lies slightly askew, and straightens and leans towards the pointer when it is over it. */
function TiltCard({ className, rest, children }: { className: string; rest: number; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const move = (event: React.PointerEvent) => {
    const card = ref.current;
    if (!card || event.pointerType !== "mouse") return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--rx", `${((0.5 - y) * 6).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${((x - 0.5) * 8).toFixed(2)}deg`);
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
    <article
      ref={ref}
      className={className}
      style={{ "--rest": `${rest}deg` } as CSSProperties}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      {children}
      <span className="diploma-sheen" aria-hidden="true" />
    </article>
  );
}

// The pinked edge of a seal: 36 points around a 140-unit square.
const SEAL_EDGE = Array.from({ length: 72 }, (_, i) => {
  const radius = i % 2 ? 57 : 62.5;
  const angle = (i / 72) * Math.PI * 2;
  return `${(70 + radius * Math.cos(angle)).toFixed(2)},${(70 + radius * Math.sin(angle)).toFixed(2)}`;
}).join(" ");

/**
 * The seal at the foot of a diploma. A conferred degree gets the university's
 * own, pressed into pale gold foil; one still under way gets an outline, and
 * a gold rule around it that is as complete as the degree.
 */
function Seal({ id, progress }: { id: string; progress?: number }) {
  if (progress === undefined) {
    return (
      <Image
        className="diploma-seal diploma-seal-pressed"
        src="/education/uottawa-seal.webp"
        alt=""
        width={536}
        height={536}
        unoptimized
      />
    );
  }
  return (
    <div className="diploma-seal" aria-hidden="true">
      <svg viewBox="0 0 140 140">
        <defs>
          <path id={`${id}-arc`} d="M70,70 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0" />
        </defs>
        <polygon className="diploma-seal-edge" points={SEAL_EDGE} />
        <circle className="diploma-seal-ring" cx="70" cy="70" r="50" />
        <circle
          className="diploma-seal-progress"
          cx="70"
          cy="70"
          r="50"
          pathLength="100"
          strokeDasharray={`${Math.round(progress * 100)} 100`}
        />
        <circle className="diploma-seal-ring" cx="70" cy="70" r="31" />
        <text className="diploma-seal-legend">
          <textPath href={`#${id}-arc`} textLength="252" lengthAdjust="spacing">
            IN PROGRESS · EXPECTED DECEMBER 2026 ·
          </textPath>
        </text>
        <text className="diploma-seal-centre" x="70" y="75.5" textAnchor="middle">
          {Math.round(progress * 100)}%
        </text>
      </svg>
    </div>
  );
}

type Sheet = {
  id: Degree["id"];
  rest: number;
  /** The lines above the name, between the name and the degree, and after it. */
  conferral: string;
  having: ReactNode;
  degree: string;
  field?: string;
  rights: ReactNode;
  given: ReactNode;
  progress?: number;
  /** What the sheet itself does not say, set under it. */
  notes: { label: string; value: ReactNode }[];
};

/** The four offices that sign a diploma, in the corners they sign in. */
const OFFICES = ["Chancellor", "Dean", "President and Vice-Chancellor", "Secretary-General"];

/**
 * A degree set out as the University of Ottawa's parchment: its two names in
 * garnet either side of its arms, the Senate's sentence down the middle, the
 * seal at the foot and an office in each corner.
 */
function Diploma({ sheet }: { sheet: Sheet }) {
  return (
    <figure className="diploma-figure">
      <TiltCard className="diploma" rest={sheet.rest}>
        <div className="diploma-sheet">
          <header className="diploma-head">
            <Image
              className="diploma-wordmark"
              lang="fr"
              src="/education/uottawa-name-fr.svg"
              alt="Université d’Ottawa"
              width={194}
              height={74}
              unoptimized
            />
            <Image className="diploma-arms" src="/education/uottawa-arms.webp" alt="" width={488} height={456} unoptimized />
            <Image
              className="diploma-wordmark"
              src="/education/uottawa-name-en.svg"
              alt="University of Ottawa"
              width={207}
              height={78}
              unoptimized
            />
          </header>
          <p className="diploma-line diploma-conferral">{sheet.conferral}</p>
          <p className="diploma-name">Youssef Chouay</p>
          <p className="diploma-line diploma-having">{sheet.having}</p>
          <h3 className="diploma-degree">{sheet.degree}</h3>
          {sheet.field && <p className="diploma-field">{sheet.field}</p>}
          <p className="diploma-line diploma-rights">{sheet.rights}</p>
          <p className="diploma-line diploma-given">{sheet.given}</p>
          <footer className="diploma-foot">
            <Seal id={`seal-${sheet.id}`} progress={sheet.progress} />
            {OFFICES.map((office) => (
              <small key={office} className="diploma-office">
                {office}
              </small>
            ))}
          </footer>
        </div>
      </TiltCard>
      <figcaption className="diploma-notes">
        <dl>
          {sheet.notes.map((note) => (
            <div key={note.label}>
              <dt>{note.label}</dt>
              <dd>{note.value}</dd>
            </div>
          ))}
        </dl>
      </figcaption>
    </figure>
  );
}

/** The two degrees as University of Ottawa diplomas on a desk. */
export function EducationCards({ progress }: { progress: number }) {
  const sheets: Sheet[] = [
    {
      id: "msc",
      rest: -1.2,
      conferral: "The Senate of the University of Ottawa will confer on",
      having: (
        <>
          on fulfilling all the requirements and <br />
          passing the prescribed examinations, the degree of
        </>
      ),
      degree: `${msc.title[0]} ${msc.title[1]}`,
      rights: (
        <>
          with all the rights, honours and privileges proper to it. <br />
          In testimony whereof the names will be subscribed and <br />
          the seal of the University affixed to this document.
        </>
      ),
      given: "Expected at Ottawa, in December 2026.",
      progress,
      notes: [
        { label: "Status", value: `In progress, ${Math.round(progress * 100)}% of the way` },
        { label: "Thesis", value: msc.thesis },
        { label: "Supervisor", value: msc.supervisor },
        { label: "Scholarships", value: msc.funding?.amount },
        { label: "Period", value: msc.period },
      ],
    },
    {
      id: "basc",
      rest: 1.6,
      conferral: "The Senate of the University of Ottawa has conferred on",
      having: (
        <>
          who has fulfilled all the requirements and <br />
          passed the prescribed examinations, the degree of
        </>
      ),
      degree: `${basc.title[0]} ${basc.title[1]}`,
      field: basc.field,
      rights: (
        <>
          with all the rights, honours and privileges proper to it. <br />
          In testimony whereof we have hereto subscribed our names and caused <br />
          the seal of the University to be affixed to this document.
        </>
      ),
      given: "Given at Ottawa, in December 2024.",
      notes: [
        { label: "Status", value: basc.status },
        { label: "Period", value: basc.period },
        { label: "Grade point average", value: basc.gpa },
        { label: "Coursework", value: basc.coursework?.map((course) => course.name).join(" · ") },
      ],
    },
  ];
  return (
    <motion.div
      className="diplomas"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {sheets.map((sheet) => (
        <Diploma key={sheet.id} sheet={sheet} />
      ))}
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

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease: EASE },
} as const;

/** Everything about the two degrees as a grid of tiles, one fact to a tile. */
export function EducationBento({ progress }: { progress: number }) {
  const percent = Math.round(progress * 100);
  const [thesisTitle, thesisRest] = (msc.thesis ?? "").split(": ");
  return (
    <motion.div className="edu-bento" {...reveal}>
      <article className="edu-tile edu-tile-msc">
        <p className="edu-tile-label">
          <span className="edu-card-dot" />
          {msc.short} · {msc.period}
        </p>
        <h3 className="edu-tile-title">
          {msc.title[0]} <em>{msc.title[1]}</em>
        </h3>
        <div className="edu-tile-thesis">
          <p className="edu-tile-label">Thesis</p>
          <p>
            {thesisTitle}
            {thesisRest && <span>: {thesisRest}</span>}
          </p>
        </div>
        <p className="edu-tile-foot">
          Supervised by <strong>{msc.supervisor}</strong>
        </p>
      </article>

      <article className="edu-tile edu-tile-funding">
        <p className="edu-tile-label">Research funding</p>
        <p className="edu-tile-number">{msc.funding?.amount}</p>
        <p className="edu-tile-foot">{msc.funding?.label}, across the degree</p>
      </article>

      <article className="edu-tile edu-tile-progress">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="52" />
          <circle cx="60" cy="60" r="52" pathLength="100" strokeDasharray={`${percent} 100`} />
        </svg>
        <p className="edu-tile-ring-value">
          {percent}
          <small>%</small>
        </p>
        <p className="edu-tile-foot">of the M.Sc. done. Expected Dec 2026.</p>
      </article>

      <article className="edu-tile edu-tile-gpa">
        <p className="edu-tile-label">{basc.short} GPA</p>
        <p className="edu-tile-number">
          {basc.gpa?.split(" / ")[0]}
          <small>/ {basc.gpa?.split(" / ")[1]}</small>
        </p>
      </article>

      <article className="edu-tile edu-tile-basc">
        <p className="edu-tile-label">
          {basc.short} · {basc.period} · {basc.status}
        </p>
        <h3 className="edu-tile-title">
          {basc.title[0]} {basc.title[1]}, <em>{basc.field}</em>
        </h3>
        <ul className="edu-card-courses">
          {basc.coursework?.map((course) => <li key={course.name}>{course.name}</li>)}
        </ul>
      </article>

      <article className="edu-tile edu-tile-school">
        <p className="edu-tile-label">Institution</p>
        <p className="edu-tile-school-name">{msc.institution}</p>
        <p className="edu-tile-years">
          <span>{basc.start[0]}</span>
          <i aria-hidden="true">
            <b style={{ "--progress": progress } as CSSProperties} />
          </i>
          <span>{msc.end[0] - 1}</span>
        </p>
      </article>
    </motion.div>
  );
}

/** The thesis takes the stage, its figure playing beside it; the bachelor's sits underneath. */
export function EducationSpotlight({ progress }: { progress: number }) {
  const [thesisTitle, thesisRest] = (msc.thesis ?? "").split(": ");
  return (
    <motion.div className="edu-spot" {...reveal}>
      <article className="edu-spot-panel">
        <div className="edu-spot-copy">
          <p className="edu-tile-label">
            <span className="edu-card-dot" />
            {msc.short} {msc.field} · {msc.period}
          </p>
          <h3 className="edu-spot-title">{thesisTitle}</h3>
          {thesisRest && <p className="edu-spot-sub">{thesisRest}</p>}
          <dl className="edu-spot-facts">
            <div>
              <dt>Supervisor</dt>
              <dd>{msc.supervisor}</dd>
            </div>
            <div>
              <dt>Funding</dt>
              <dd>{msc.funding?.amount}</dd>
            </div>
            <div>
              <dt>Progress</dt>
              <dd>{Math.round(progress * 100)}%</dd>
            </div>
          </dl>
        </div>
        <div className="edu-spot-figure" data-guide-skip>
          <ThesisFigure />
        </div>
      </article>

      <article className="edu-spot-strip">
        <span className="edu-spot-strip-short">{basc.short}</span>
        <span>
          {basc.title[0]} {basc.title[1]}, <em>{basc.field}</em>
        </span>
        <span>{basc.period}</span>
        <span>GPA {basc.gpa}</span>
      </article>
    </motion.div>
  );
}

/** The years set large and hollow, each degree written beside its own. */
export function EducationYears() {
  return (
    <motion.div className="edu-years" {...reveal}>
      {[msc, basc].map((degree) => (
        <article key={degree.id} className="edu-year">
          <p className="edu-year-number" aria-hidden="true">
            <span>{degree.start[0]}</span>
            <span>{String(degree.end[0] - 1).slice(2)}</span>
          </p>
          <div className="edu-year-copy">
            <p className="edu-tile-label">
              {degree.short} · {degree.status}
            </p>
            <h3 className="edu-tile-title">
              {degree.title[0]} <em>{degree.id === "msc" ? degree.title[1] : `${degree.title[1]}, ${degree.field}`}</em>
            </h3>
            {degree.thesis ? (
              <p className="edu-year-lead">{degree.thesis}</p>
            ) : (
              <ul className="edu-card-courses">
                {degree.coursework?.map((course) => <li key={course.name}>{course.name}</li>)}
              </ul>
            )}
            <dl className="edu-row-facts">
              {facts(degree)
                .filter((fact) => fact.label !== "Status")
                .map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </article>
      ))}
    </motion.div>
  );
}
