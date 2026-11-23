"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
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
 * The seal on a diploma. A conferred degree gets it in gold foil; one still
 * under way gets the outline, and a gold rule around it that is as complete
 * as the degree is.
 */
function Seal({ id, legend, centre, progress }: { id: string; legend: string; centre: string; progress?: number }) {
  const pending = progress !== undefined;
  return (
    <div className="diploma-seal" data-pending={pending ? "" : undefined} aria-hidden="true">
      <svg viewBox="0 0 140 140">
        <defs>
          <linearGradient id={`${id}-foil`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3dc9b" />
            <stop offset="0.32" stopColor="#c79a3a" />
            <stop offset="0.55" stopColor="#f7e7b4" />
            <stop offset="0.78" stopColor="#b3842b" />
            <stop offset="1" stopColor="#e6c873" />
          </linearGradient>
          <path id={`${id}-arc`} d="M70,70 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0" />
        </defs>
        <polygon className="diploma-seal-edge" points={SEAL_EDGE} fill={pending ? undefined : `url(#${id}-foil)`} />
        <circle className="diploma-seal-ring" cx="70" cy="70" r="50" />
        {pending && (
          <circle
            className="diploma-seal-progress"
            cx="70"
            cy="70"
            r="50"
            pathLength="100"
            strokeDasharray={`${Math.round(progress * 100)} 100`}
          />
        )}
        <circle className="diploma-seal-ring" cx="70" cy="70" r="31" />
        <text className="diploma-seal-legend">
          <textPath href={`#${id}-arc`} textLength="252" lengthAdjust="spacing">
            {legend}
          </textPath>
        </text>
        <text className="diploma-seal-centre" x="70" y="75.5" textAnchor="middle">
          {centre}
        </text>
      </svg>
    </div>
  );
}

const SHIELD = "M12,6 H108 V60 C108,88 86,106 60,118 C34,106 12,88 12,60 Z";
const ESCUTCHEON = "M-3,-3.6 H3 V0.6 C3,2.6 1.6,3.8 0,4.6 C-1.6,3.8 -3,2.6 -3,0.6 Z";
const PAGE = "M0,-6.5 C-4,-9 -9,-9 -13,-7 V7 C-9,5 -4,5 0,7.5 Z";
const BINDING = "M-13,7 C-9,5 -4,5 0,7.5 C4,5 9,5 13,7 V8.8 C9,6.8 4,6.8 0,9.3 C-4,6.8 -9,6.8 -13,8.8 Z";
const PETAL = "M-0.5,1.3 C-1.2,-0.6 -2.6,-1.6 -3.4,-0.6 C-3.9,0.2 -3.2,1 -2.5,0.7 C-2.6,1.4 -1.6,1.7 -0.5,1.3 Z";

/**
 * The University of Ottawa's shield, drawn from its blazon: garnet strewn
 * with small white shields and, on a white band, two open books, one showing
 * a rose and the other a fleur-de-lys. The motto runs on the scroll beneath.
 */
function Arms({ id }: { id: string }) {
  return (
    <svg className="diploma-arms" viewBox="0 0 120 152" aria-hidden="true">
      <defs>
        <clipPath id={`${id}-shield`}>
          <path d={SHIELD} />
        </clipPath>
        <pattern id={`${id}-seme`} width="16" height="19" patternUnits="userSpaceOnUse" patternTransform="translate(4 3.5)">
          <path d={ESCUTCHEON} transform="translate(4 5)" />
          <path d={ESCUTCHEON} transform="translate(12 14.5)" />
        </pattern>
        <path id={`${id}-motto`} d="M13,133.5 Q60,150.5 107,133.5" />
      </defs>
      <path className="diploma-arms-field" d={SHIELD} />
      <g clipPath={`url(#${id}-shield)`}>
        <rect className="diploma-arms-seme" width="120" height="120" fill={`url(#${id}-seme)`} />
        <rect className="diploma-arms-fess" x="0" y="42" width="120" height="30" />
        {[37, 83].map((x, book) => (
          <g key={x} transform={`translate(${x} 56.5)`}>
            <path className="diploma-arms-binding" d={BINDING} />
            <path className="diploma-arms-page" d={PAGE} />
            <path className="diploma-arms-page" d={PAGE} transform="scale(-1 1)" />
            <path className="diploma-arms-lines" d="M2.5,-4.6 C5.5,-6 8,-6 10.5,-5.2 M2.5,-1.8 C5.5,-3.2 8,-3.2 10.5,-2.4 M2.5,1 C5.5,-0.4 8,-0.4 10.5,0.4" />
            {book === 0 ? (
              <g className="diploma-arms-charge" transform="translate(-6.5 -1)">
                {[0, 1, 2, 3, 4].map((petal) => (
                  <circle key={petal} r="1.45" cx={(1.75 * Math.sin((petal * 2 * Math.PI) / 5)).toFixed(2)} cy={(-1.75 * Math.cos((petal * 2 * Math.PI) / 5)).toFixed(2)} />
                ))}
                <circle className="diploma-arms-seed" r="0.8" />
              </g>
            ) : (
              <g className="diploma-arms-charge" transform="translate(-6.5 -1.2)">
                <path d="M0,-3.8 C1.5,-1.9 1.4,0 0,1.4 C-1.4,0 -1.5,-1.9 0,-3.8 Z" />
                <path d={PETAL} />
                <path d={PETAL} transform="scale(-1 1)" />
                <rect x="-1.9" y="1.3" width="3.8" height="0.8" />
                <path d="M0,2.1 L1.3,3.7 H-1.3 Z" />
              </g>
            )}
          </g>
        ))}
        <path className="diploma-arms-rule" d="M0,42 H120 M0,72 H120" />
      </g>
      <path className="diploma-arms-edge" d={SHIELD} />
      <path className="diploma-arms-scroll" d="M9,125 Q60,143 111,125 L111,138 Q60,156 9,138 Z" />
      <text className="diploma-arms-motto">
        <textPath href={`#${id}-motto`} startOffset="50%" textAnchor="middle">
          DEUS SCIENTIARUM DOMINUS EST
        </textPath>
      </text>
    </svg>
  );
}

type Bilingual = [french: ReactNode, english: ReactNode];

/** One line of a diploma, in French and in English. */
function Pair({ className = "", text }: { className?: string; text: Bilingual }) {
  return (
    <p className={`diploma-pair ${className}`}>
      <span lang="fr">{text[0]}</span>
      <span>{text[1]}</span>
    </p>
  );
}

type Sheet = {
  id: Degree["id"];
  rest: number;
  conferral: Bilingual;
  title: Bilingual;
  field?: Bilingual;
  thesis?: string;
  courses?: string;
  dated: Bilingual;
  slots: [Slot, Slot];
  seal: ReactNode;
};

type Slot = { value: ReactNode; label: string };

/**
 * A degree as the university's own parchment: its arms between its two
 * names, the Senate's sentence in both languages either side of the sheet,
 * the name across the middle, and the seal at the foot.
 */
function Diploma({ sheet }: { sheet: Sheet }) {
  const slot = ({ value, label }: Slot) => (
    <div className="diploma-slot">
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
  return (
    <TiltCard className="diploma" rest={sheet.rest}>
      <div className="diploma-sheet">
        <header className="diploma-head">
          <p lang="fr">Université d’Ottawa</p>
          <Arms id={`arms-${sheet.id}`} />
          <p>University of Ottawa</p>
        </header>
        <Pair text={sheet.conferral} />
        <p className="diploma-name">Youssef Chouay</p>
        <Pair className="diploma-quiet" text={["le grade de", "the degree of"]} />
        <h3 className="diploma-pair diploma-degree">
          <span lang="fr">{sheet.title[0]}</span>
          <span>{sheet.title[1]}</span>
        </h3>
        {sheet.field && <Pair className="diploma-field" text={sheet.field} />}
        {sheet.thesis && (
          <p className="diploma-extra">
            <small>Thèse · Thesis</small>
            {sheet.thesis}
          </p>
        )}
        {sheet.courses && (
          <p className="diploma-extra">
            <small>Cours · Coursework</small>
            {sheet.courses}
          </p>
        )}
        <Pair className="diploma-rights" text={sheet.dated} />
        <footer className="diploma-foot">
          {slot(sheet.slots[0])}
          {sheet.seal}
          {slot(sheet.slots[1])}
        </footer>
        <p className="diploma-micro">Reproduction pour portfolio · Portfolio rendering, not an official document</p>
      </div>
    </TiltCard>
  );
}

/** The two degrees as University of Ottawa diplomas on a desk. */
export function EducationCards({ progress }: { progress: number }) {
  const sheets: Sheet[] = [
    {
      id: "msc",
      rest: -1.2,
      conferral: [
        "Le Sénat de l’Université d’Ottawa, sur la recommandation de la Faculté de génie, conférera à",
        "The Senate of the University of Ottawa, on the recommendation of the Faculty of Engineering, will confer upon",
      ],
      title: [
        <>
          Maîtrise en <br />
          informatique
        </>,
        <>
          {msc.title[0]} <br />
          {msc.title[1]}
        </>,
      ],
      thesis: msc.thesis,
      dated: [
        "avec tous les droits, honneurs et privilèges qui s’y rattachent. Études entreprises en janvier 2025 ; grade attendu à Ottawa, Canada, en décembre 2026.",
        "with all the rights, honours and privileges pertaining thereto. Studies begun in January 2025; degree expected at Ottawa, Canada, in December 2026.",
      ],
      slots: [
        { value: msc.supervisor, label: "Directrice de thèse · Thesis supervisor" },
        { value: msc.funding?.amount, label: "Bourses d’études · Scholarships" },
      ],
      seal: (
        <Seal
          id="seal-msc"
          legend="EN COURS · IN PROGRESS · DÉCEMBRE · DECEMBER 2026 ·"
          centre={`${Math.round(progress * 100)}%`}
          progress={progress}
        />
      ),
    },
    {
      id: "basc",
      rest: 1.6,
      conferral: [
        "Le Sénat de l’Université d’Ottawa, sur la recommandation de la Faculté de génie, a conféré à",
        "The Senate of the University of Ottawa, on the recommendation of the Faculty of Engineering, has conferred upon",
      ],
      title: [
        <>
          Baccalauréat ès <br />
          sciences appliquées
        </>,
        <>
          {basc.title[0]} <br />
          {basc.title[1]}
        </>,
      ],
      field: ["Génie logiciel", basc.field],
      courses: basc.coursework?.map((course) => course.name).join(" · "),
      dated: [
        "avec tous les droits, honneurs et privilèges qui s’y rattachent. Fait à Ottawa, Canada, en décembre 2024.",
        "with all the rights, honours and privileges pertaining thereto. Given at Ottawa, Canada, in December 2024.",
      ],
      slots: [
        { value: basc.period, label: "Période d’études · Period of study" },
        { value: basc.gpa, label: "Moyenne pondérée · Grade point average" },
      ],
      seal: <Seal id="seal-basc" legend="CONFÉRÉ · CONFERRED · DÉCEMBRE · DECEMBER 2024 ·" centre={basc.short} />,
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
