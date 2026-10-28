"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { SerializableProject } from "@/components/project-detail";
import { Facts, Hero, ProjectPage, Rows, Section, TabList } from "@/components/projects/case-study-chrome";

const DOWNLOAD = "https://github.com/yssf-c/Querno-releases/releases/latest";

/** A few lines of source and the page they set, drawn here with MathML (static markup, so it goes in as HTML). */
const SAMPLES = [
  {
    id: "identity", label: "An equation", source: String.raw`\[ e^{i\pi} + 1 = 0 \]`,
    text: "Display math, centered on its own line.",
    page: `<math display="block" aria-label="e to the power i pi, plus one, equals zero"><msup><mi>e</mi><mrow><mi>i</mi><mi>π</mi></mrow></msup><mo>+</mo><mn>1</mn><mo>=</mo><mn>0</mn></math>`,
  },
  {
    id: "series", label: "A series", source: String.raw`\[ \sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6} \]`,
    text: "Limits above and below the sum, and fractions set in full.",
    page: `<math display="block" aria-label="The sum from n equals one to infinity of one over n squared equals pi squared over six"><munderover><mo>∑</mo><mrow><mi>n</mi><mo>=</mo><mn>1</mn></mrow><mi>∞</mi></munderover><mfrac><mn>1</mn><msup><mi>n</mi><mn>2</mn></msup></mfrac><mo>=</mo><mfrac><msup><mi>π</mi><mn>2</mn></msup><mn>6</mn></mfrac></math>`,
  },
  {
    id: "section", label: "A section", source: String.raw`\section{Setting}` + "\n" + String.raw`Let $f$ be \emph{smooth} and convex.`,
    text: "A numbered heading, then text with inline math and emphasis.",
    page: `<div class="querno-section"><p><span>1</span>Setting</p><p>Let <i>f</i> be <em>smooth</em> and convex.</p></div>`,
  },
];

/** Commands, braces and math shifts tinted the way the editor shows them. */
function Source({ code }: { code: string }) {
  return <code>{code.split(/(\\[a-zA-Z]+|\\\[|\\\]|[{}$])/).map((part, i) =>
    /^\\[a-zA-Z]+$/.test(part) ? <span key={i} data-token="command">{part}</span>
      : /^[{}]$/.test(part) ? <span key={i} data-token="brace">{part}</span>
      : /^(\$|\\\[|\\\])$/.test(part) ? <span key={i} data-token="math">{part}</span>
      : part)}</code>;
}

function Screenshot({ name, alt, priority = false }: { name: string; alt: string; priority?: boolean }) {
  const sizes = "(max-width: 860px) 90vw, 1120px";
  return <div className="querno-window">
    <Image src={`/querno/${name}-light.webp`} alt={alt} width={2000} height={1250} priority={priority} sizes={sizes} className="dark:hidden" />
    <Image src={`/querno/${name}-dark.webp`} alt={`${alt}, dark appearance`} width={2000} height={1250} priority={priority} sizes={sizes} className="hidden dark:block" />
  </div>;
}

export function QuernoExperience({ project }: { project: SerializableProject }) {
  const [selected, setSelected] = useState(0);
  const sample = SAMPLES[selected];
  return <ProjectPage id="querno" theme="querno-theme">
    <Hero
      layout="stacked"
      mark={<Image src="/querno/icon.svg" alt="" width={30} height={30} />}
      name="Querno"
      title="A LaTeX editor that stays on your Mac."
      lede="Querno is a local LaTeX editor with a live PDF preview. It typesets with a bundled engine, needs no account, and keeps every project, PDF and version on your own disk."
      actions={<>
        <a href={project.link} target="_blank" rel="noopener noreferrer" className="pp-button">Visit the website<ArrowUpRight size={16} /></a>
        <a href={DOWNLOAD} target="_blank" rel="noopener noreferrer" className="pp-link">Download for Mac<ArrowUpRight size={14} /></a>
      </>}
      meta="macOS 13.5 or later on Apple Silicon · No account"
      visual={<Screenshot name="editor" alt="Querno’s editor, with LaTeX source on the left and the typeset PDF on the right" priority />}
    />

    <Facts items={[
      ["Platform", "Mac"],
      ["Year", project.timeline ?? "2026"],
      ["Built with", project.technologies.join(", ")],
    ]} />

    <Section id="typesetting" title="On the page" wide={<>
      <TabList label="LaTeX examples" prefix="querno" items={SAMPLES} selected={selected} onSelect={setSelected} />
      <div id="querno-panel" role="tabpanel" aria-labelledby={`querno-tab-${sample.id}`} tabIndex={0}>
        <div className="querno-demo">
          <figure><figcaption>main.tex</figcaption><Source code={sample.source} /></figure>
          <figure><figcaption>main.pdf</figcaption><div className="querno-paper" key={sample.id} dangerouslySetInnerHTML={{ __html: sample.page }} /></figure>
        </div>
        <p className="pp-caption">{sample.text}</p>
        <p className="pp-note">Drawn here in the browser. Querno sets the real page with Tectonic.</p>
      </div>
    </>}>
      <p>Write the source on one side and read the page on the other. Builds run after a pause in typing, or right away with ⌘↵.</p>
      <p>“Show in PDF” scrolls to the line under the cursor, and double-clicking the PDF jumps back to the source that produced it. Common errors are explained in plain words and linked to their file and line.</p>
    </Section>

    <Section id="library" title="The library" wide={<Screenshot name="library" alt="Querno’s project library, showing four projects with page thumbnails" />}>
      <p>Projects sit in workspaces, with favorites, search, and a trash that never empties itself. New ones start from six templates: blank, article, notes, report, résumé and letter. Any project imports from or exports to a plain ZIP.</p>
    </Section>

    <Section id="engineering" title="How it’s built">
      <Rows items={[
        ["Typesetting", "A bundled copy of Tectonic 0.17.0, pinned and checked by SHA-256, fetches TeX packages on demand and reruns until references settle. pdfLaTeX, XeLaTeX and LuaLaTeX work too when they are installed."],
        ["Local service", "A small Node service listens only on the loopback interface. Each build compiles a snapshot of the saved sources, can be cancelled, and keeps the last good PDF when it fails."],
        ["Version history", "Every save is committed to a private Git repository inside the project through isomorphic-git. Restoring an old version adds a new one, so later work is never lost."],
        ["The Mac app", "A Swift shell hosts the React editor in a WebKit window with native menus, file pickers and export dialogs. Projects live in ~/.querno, so replacing the app keeps them."],
      ]} />
    </Section>
  </ProjectPage>;
}
