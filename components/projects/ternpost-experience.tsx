"use client";

import { useEffect, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTheme } from "next-themes";
import type { SerializableProject } from "@/components/project-detail";
import { Facts, Hero, ProjectPage, Rows, Section } from "@/components/projects/case-study-chrome";

const EARLY_ACCESS = "https://ternpost.vercel.app/#early-access";

type Mode = "light" | "dark";

/** The four screens the website shows, captured from the current build with sample mail. */
const VIEWS = [
  { id: "inbox", label: "Inbox", key: "J", alt: "a sidebar of mailboxes and three accounts, a list of conversations grouped by day, and the selected conversation open on the right", caption: <>Every account in one list, with notifications and newsletters bundled out of the way.</> },
  { id: "commands", label: "Commands", key: "⌘K", alt: "the command palette over the inbox, filtered by the letters sno, with Snooze and its H shortcut first", caption: <><kbd>⌘K</kbd> finds any command by name and shows its shortcut, so you learn it for next time.</> },
  { id: "search", label: "Search", key: "/", alt: "a search for budget returning one conversation, opened with its spreadsheet attachment", caption: <>Search answers from the mail on your Mac first, so results appear as you type.</> },
  { id: "reply", label: "Reply", key: "R", alt: "an inline reply being written under a dinner invitation, with Send and Send and Archive buttons", caption: <>Replies open in place. <kbd>⌘</kbd><kbd>⇧</kbd><kbd>↵</kbd> sends and archives in one go.</> },
];

/** The app’s seven themes. Colours are bg, surface, text, muted, accent and line, as on the website. */
const THEMES = [
  { id: "paper", name: "Paper", description: "Warm off-white, ink-brown type and a terracotta accent. Reads like a well-set letter.", light: "#f6f2ea,#fffdf8,#22190f,#5f5446,#b2461f,#e7dfd2", dark: "#141110,#1c1816,#f3ece4,#b9ad9f,#e07a52,#332c27" },
  { id: "classic", name: "Classic", description: "Neutral greys with a bright, familiar blue. The safe choice that never gets in the way.", light: "#f5f5f7,#ffffff,#18181c,#5d5d68,#0871dc,#e6e6eb", dark: "#0f0f12,#17171b,#f1f1f4,#a8a8b3,#0871dc,#2a2a31" },
  { id: "graphite", name: "Graphite", description: "Monochrome and quiet. Ink is the accent; only unread mail gets colour.", light: "#f4f4f5,#ffffff,#111113,#52525b,#18181b,#e4e4e7", dark: "#0b0b0c,#141416,#f4f4f5,#a1a1aa,#f4f4f5,#26262a" },
  { id: "fjord", name: "Fjord", description: "Cool slate and deep sea blue. Calm, crisp, and very legible at night.", light: "#eef2f6,#ffffff,#0f1a26,#4a5a6b,#24609f,#dde4ec", dark: "#0a1017,#111a24,#e8eef5,#9fb0c2,#5b9be0,#223041" },
  { id: "sage", name: "Sage", description: "Soft green-grey with a forest accent. Low glare for long triage sessions.", light: "#f1f4ef,#fdfefc,#141b15,#4d5a4f,#2f6e4d,#dfe5dc", dark: "#0c110e,#131a15,#e9f0ea,#a2b3a5,#5fb88a,#233027" },
  { id: "plum", name: "Plum", description: "Dusky violet neutrals with a jewel-tone accent. Distinctive without shouting.", light: "#f5f2f7,#ffffff,#1a1320,#584d61,#6d3fae,#e6e0eb", dark: "#100c14,#18121e,#f1ebf6,#b4a8bf,#a67de8,#2d2336" },
  { id: "ember", name: "Ember", description: "Charcoal with amber light, like reading by a lamp. The light side is cream.", light: "#f7f3ec,#fffcf6,#1d1610,#5c5144,#9a5c06,#e8e0d3", dark: "#0e0c0a,#171411,#f5eee4,#b8ab9a,#f0a63a,#2c2620" },
].map(theme => ({ ...theme, light: theme.light.split(","), dark: theme.dark.split(",") }));

const TOKENS = ["bg", "surface", "text", "muted", "fill", "line"];

const capture = (view: string, theme: string, mode: Mode) => `/ternpost/app/${view}-${theme}-${mode}.webp`;

/** Starts fetching a capture so choosing it feels instant. */
const warm = (src: string) => { const img = new window.Image(); img.src = src; return img; };

function Screenshot({ name, alt, priority = false }: { name: string; alt: string; priority?: boolean }) {
  const sizes = "(max-width: 860px) 90vw, 1120px";
  return <div className="tern-window">
    <Image src={capture(name, "paper", "light")} alt={alt} width={1920} height={1200} priority={priority} sizes={sizes} className="dark:hidden" />
    <Image src={capture(name, "paper", "dark")} alt={`${alt}, dark appearance`} width={1920} height={1200} priority={priority} sizes={sizes} className="hidden dark:block" />
  </div>;
}

/** Radio buttons drawn as a segmented control, with a pill that slides to the chosen one. */
function Segmented<T extends string>({ legend, name, options, value, onChange, onWarm }: {
  legend: string; name: string; options: { id: T; label: ReactNode }[]; value: T; onChange: (id: T) => void; onWarm: (id: T) => void;
}) {
  const reduce = useReducedMotion();
  return <fieldset className={`tern-segmented tern-${name}`}>
    <legend className="sr-only">{legend}</legend>
    {options.map(option => <label key={option.id} onPointerEnter={() => onWarm(option.id)}>
      <input type="radio" name={`tern-${name}`} value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} />
      {value === option.id && <motion.span layoutId={`tern-${name}-pill`} className="tern-pill" aria-hidden transition={reduce ? { duration: 0 } : { type: "spring", bounce: .18, duration: .45 }} />}
      <span>{option.label}</span>
    </label>)}
  </fieldset>;
}

/** The website’s theme showcase: pick a view, a theme and an appearance, and the panel takes that theme’s colours. */
function Showcase() {
  const { resolvedTheme } = useTheme();
  const [view, setView] = useState(VIEWS[0].id);
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [chosenMode, setChosenMode] = useState<Mode | null>(null);
  const mode: Mode = chosenMode ?? (resolvedTheme === "dark" ? "dark" : "light");
  const theme = THEMES.find(item => item.id === themeId) ?? THEMES[0];
  const current = VIEWS.find(item => item.id === view) ?? VIEWS[0];
  const src = capture(view, themeId, mode);

  // The captures on screen, newest last. A new one fades in over the old, which is then dropped.
  const [layers, setLayers] = useState(() => [src]);
  useEffect(() => {
    let live = true;
    const img = warm(src);
    img.decode().catch(() => undefined).then(() => {
      if (live) setLayers(previous => previous.at(-1) === src ? previous : [...previous.slice(-1), src]);
    });
    return () => { live = false; };
  }, [src]);
  const loading = layers.at(-1) !== src;

  const colours = theme[mode];
  const style = Object.fromEntries(TOKENS.map((token, index) => [`--tern-${token}`, colours[index]])) as CSSProperties;

  return <div className="tern-showcase" data-mode={mode} data-loading={loading || undefined} style={style} data-guide-skip>
    <form className="tern-controls" aria-label="Preview the app" onSubmit={event => event.preventDefault()}>
      <Segmented legend="View" name="view" value={view} onChange={setView} onWarm={id => warm(capture(id, themeId, mode))}
        options={VIEWS.map(item => ({ id: item.id, label: <><kbd>{item.key}</kbd>{item.label}</> }))} />
      <div className="tern-looks">
        <fieldset className="tern-chips">
          <legend className="sr-only">Theme</legend>
          {THEMES.map(item => <label key={item.id} title={item.name} onPointerEnter={() => warm(capture(view, item.id, mode))}
            style={{ "--l-bg": item.light[0], "--l-fill": item.light[4], "--d-bg": item.dark[0], "--d-fill": item.dark[4] } as CSSProperties}>
            <input type="radio" name="tern-theme" value={item.id} checked={themeId === item.id} onChange={() => setThemeId(item.id)} />
            <span className="tern-chip" aria-hidden />
            <span className="sr-only">{item.name}</span>
          </label>)}
        </fieldset>
        <Segmented<Mode> legend="Appearance" name="mode" value={mode} onChange={setChosenMode} onWarm={id => warm(capture(view, themeId, id))}
          options={[{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }]} />
      </div>
    </form>

    <figure className="tern-stage-window">
      <div className="tern-window-bar" aria-hidden><span /><span /><span /></div>
      <div className="tern-stage">
        {layers.map((layer, index) => <Image key={layer} src={layer} fill unoptimized priority={index === 0 && layers.length === 1}
          alt={index === layers.length - 1 ? `Ternpost’s main window in the ${theme.name} theme, ${mode}: ${current.alt}.` : ""}
          onAnimationEnd={() => setLayers(previous => previous.at(-1) === layer ? [layer] : previous)} />)}
      </div>
      <figcaption>
        <p>{current.caption}</p>
        <p aria-live="polite"><strong>{theme.name}, {mode}.</strong> {theme.description}</p>
      </figcaption>
    </figure>
  </div>;
}

/** Sample mail for the triage demo. Nothing here is sent anywhere. */
const MAIL = [
  { from: "Mara Lindqvist", subject: "Draft of the Lisbon talk, comments welcome", time: "9:41" },
  { from: "Build bot", subject: "Checks passed on main", time: "9:12" },
  { from: "Dev Patel", subject: "Re: lunch on Thursday?", time: "8:55" },
  { from: "Northwind Air", subject: "Your boarding pass for Lisbon to Reykjavík", time: "8:30" },
  { from: "Ola Bakker", subject: "Photos from the ferry", time: "Tue" },
];

const KEYS = [
  { key: "j", label: "Next conversation" },
  { key: "k", label: "Previous conversation" },
  { key: "e", label: "Archive" },
  { key: "z", label: "Undo" },
] as const;

/** A small inbox driven by the same four keys as the app. */
function Triage() {
  const [inbox, setInbox] = useState(() => MAIL.map((_, index) => index));
  const [cursor, setCursor] = useState(0);
  const [archived, setArchived] = useState<{ id: number; at: number }[]>([]);
  const [status, setStatus] = useState("Click the inbox, then press J, K, E or Z.");

  const press = (key: string) => {
    if (key === "j" || key === "k") {
      if (!inbox.length) return;
      const next = key === "j" ? Math.min(cursor + 1, inbox.length - 1) : Math.max(cursor - 1, 0);
      setCursor(next);
      setStatus(`${MAIL[inbox[next]].from}: ${MAIL[inbox[next]].subject}`);
    } else if (key === "e") {
      if (!inbox.length) return;
      const id = inbox[cursor];
      const rest = inbox.filter((_, index) => index !== cursor);
      setInbox(rest);
      setArchived([...archived, { id, at: cursor }]);
      setCursor(Math.min(cursor, Math.max(rest.length - 1, 0)));
      setStatus(rest.length ? `Archived “${MAIL[id].subject}”. Z brings it back.` : "Inbox zero. Z still brings the last one back.");
    } else if (key === "z") {
      const last = archived.at(-1);
      if (!last) return;
      const restored = [...inbox];
      restored.splice(last.at, 0, last.id);
      setInbox(restored);
      setArchived(archived.slice(0, -1));
      setCursor(last.at);
      setStatus(`Undone. “${MAIL[last.id].subject}” is back.`);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (!KEYS.some(item => item.key === key)) return;
    event.preventDefault();
    press(key);
  };

  return <div className="tern-airmail" data-guide-skip>
    <div className="tern-triage" role="group" aria-label="Sample inbox. Press J and K to move, E to archive, Z to undo." tabIndex={0} onKeyDown={onKeyDown}>
      <div className="tern-inbox">
        <header><strong>Inbox</strong><span>{inbox.length} conversations</span></header>
        {inbox.length
          ? <ol>{inbox.map((id, index) => <li key={id} aria-current={index === cursor ? "true" : undefined}>
              <span>{MAIL[id].from}</span><span>{MAIL[id].subject}</span><span>{MAIL[id].time}</span>
            </li>)}</ol>
          : <div className="tern-empty"><p>Nothing left. Every one is archived.</p><button type="button" onClick={() => { setInbox(MAIL.map((_, index) => index)); setArchived([]); setCursor(0); setStatus("Back to five conversations."); }}>Start again</button></div>}
      </div>
      <div className="tern-keys">
        {KEYS.map(({ key, label }) => <button key={key} type="button" onClick={() => press(key)} disabled={key === "z" ? !archived.length : !inbox.length}><kbd>{key.toUpperCase()}</kbd>{label}</button>)}
        <p role="status" aria-live="polite">{status}</p>
      </div>
    </div>
  </div>;
}

export function TernpostExperience({ project }: { project: SerializableProject }) {
  return <ProjectPage id="ternpost" theme="ternpost-theme">
    <Hero
      layout="stacked"
      mark={<Image src="/ternpost/icon.svg" alt="" width={30} height={30} />}
      name="Ternpost"
      title="Get through your inbox without touching the mouse."
      lede="Ternpost is a mail app for Mac that puts Gmail, Outlook and IMAP accounts in one list and gives every action a key. Archive, reply and snooze happen on your device at once, then reach your provider."
      actions={<>
        <a href={project.link} target="_blank" rel="noopener noreferrer" className="pp-button">Visit the website<ArrowUpRight size={16} /></a>
        <a href={EARLY_ACCESS} target="_blank" rel="noopener noreferrer" className="pp-link">Request early access<ArrowUpRight size={14} /></a>
      </>}
      meta="Mac · Gmail, Microsoft 365, Outlook.com, iCloud and IMAP · Early access"
      visual={<Screenshot name="inbox" alt="Ternpost’s inbox, with the account sidebar, a list of conversations and the open message" priority />}
    />

    <Facts items={[
      ["Platform", "Mac"],
      ["Year", project.timeline ?? "2026"],
      ["Built with", project.technologies.join(", ")],
    ]} />

    <Section id="keyboard" title="On the keyboard" wide={<Triage />}>
      <p>Press E and the conversation is archived on your Mac straight away. Ternpost sends the change to Gmail or Outlook a moment later, so Z can still take it back.</p>
      <p>Every action has a key, from snoozing with H to clearing a whole view with ⇧E. Press ? in the app to see them all, or rebind them in Settings.</p>
    </Section>

    <Section id="screens" title="Try it in any theme" wide={<Showcase />}>
      <p>One window: your accounts on the left, the conversation list in the middle, and the message beside it. Pick a view, then one of the app’s seven themes in light or dark.</p>
      <p className="pp-note">Screens from the current build, filled with sample mail.</p>
    </Section>

    <Section id="engineering" title="How it’s built">
      <Rows items={[
        ["A Rust core", "Tauri 2 hosts a Rust core that keeps mail, full-text search and a durable action queue in SQLite, and syncs in the background every 30 seconds."],
        ["One provider trait", "Gmail, Microsoft Graph and IMAP/SMTP each implement the same trait and hand over raw MIME, so parsing and outgoing mail are written once."],
        ["Undo that recalls", "Archive, trash and send wait six seconds in the queue before reaching the network, which is why Undo can recall them outright. Queued sends keep their exact bytes."],
        ["Mail in a sealed frame", "Messages are sanitized and rendered in an opaque-origin frame with sender scripts stripped and remote images blocked until allowed. Sign-ins stay in the system keychain."],
        ["Keys from one table", "The React interface drives the keyboard, the command palette and the menus from a single shortcut table."],
      ]} />
    </Section>
  </ProjectPage>;
}
