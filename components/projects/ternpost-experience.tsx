"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { SerializableProject } from "@/components/project-detail";
import { Facts, Hero, ProjectPage, Rows, Section, TabList } from "@/components/projects/case-study-chrome";

const EARLY_ACCESS = "https://ternpost.vercel.app/#early-access";

const VIEWS = [
  { id: "inbox", label: "Inbox", alt: "Ternpost’s inbox, with the account sidebar, a list of conversations and the open message", text: "Every account in one list, with notifications and newsletters bundled out of the way." },
  { id: "reply", label: "Reply", alt: "Ternpost replying to a conversation, with the composer open below the message", text: "Reply in place with R. Signatures, templates, scheduled sending and Send & Archive are a key away." },
  { id: "search", label: "Search", alt: "Ternpost’s search results for “budget”, with the matching conversation open", text: "Search reads the mail on your device first, then asks your provider for anything older." },
  { id: "commands", label: "Command palette", alt: "Ternpost’s command palette filtered to “sno”, listing Snooze and other commands with their shortcuts", text: "⌘K finds every command by name, and shows the key that does it next time." },
];

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

function Screenshot({ name, alt, priority = false }: { name: string; alt: string; priority?: boolean }) {
  const sizes = "(max-width: 860px) 90vw, 1120px";
  return <div className="tern-window">
    <Image src={`/ternpost/${name}-light.webp`} alt={alt} width={1920} height={1200} priority={priority} sizes={sizes} className="dark:hidden" />
    <Image src={`/ternpost/${name}-dark.webp`} alt={`${alt}, dark appearance`} width={1920} height={1200} priority={priority} sizes={sizes} className="hidden dark:block" />
  </div>;
}

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
  const [selected, setSelected] = useState(0);
  const view = VIEWS[selected];
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
      visual={<Screenshot name="inbox" alt={VIEWS[0].alt} priority />}
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

    <Section id="screens" title="Inside the app" wide={<>
      <TabList label="Ternpost screens" prefix="ternpost" items={VIEWS} selected={selected} onSelect={setSelected} />
      <div id="ternpost-panel" role="tabpanel" aria-labelledby={`ternpost-tab-${view.id}`} tabIndex={0}>
        <Screenshot key={view.id} name={view.id} alt={view.alt} />
        <p className="pp-caption">{view.text}</p>
        <p className="pp-note">Screens from the current build, filled with sample mail.</p>
      </div>
    </>}>
      <p>One window: your accounts on the left, the conversation list in the middle, and the message beside it. The app ships with seven themes, each in light and dark; these are Paper.</p>
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
