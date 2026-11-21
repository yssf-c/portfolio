"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { LocalTime } from "@/components/local-time";

const EMAIL = "ychou031@uottawa.ca";

const links = [
  { label: "GitHub", href: "https://github.com/yssf-c" },
  { label: "LinkedIn", href: "https://linkedin.com/in/youssef-chouay" },
  { label: "CV", href: "/data/resume.pdf" },
];

/** A link that leans towards the pointer while it is near, and springs back when it leaves. */
function Magnetic({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 170, damping: 14, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 170, damping: 14, mass: 0.6 });

  return (
    <motion.a
      href={href}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={(event) => {
        if (reduceMotion || event.pointerType !== "mouse") return;
        const box = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - (box.left + box.width / 2)) * 0.38);
        y.set((event.clientY - (box.top + box.height / 2)) * 0.38);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.a>
  );
}

export function Footer() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    // The page above is a sheet that lifts off this panel: on larger screens the panel is
    // fixed to the viewport and only shows through the footer's own box.
    <footer className="site-footer">
      <div className="site-footer-panel">
        <div className="site-footer-top">
          <p>
            Research, a role, or a project worth building.
            <br />
            The fastest way to reach me is email.
          </p>
          <p className="site-footer-place" data-guide-skip>
            Ottawa, Canada
            <br />
            <LocalTime /> local time
          </p>
        </div>

        <div className="site-footer-middle">
          {/* SAY「مرحبا」HI */}
          <div className="site-footer-hello" aria-hidden="true">
            <span>SAY</span>
            <span className="site-footer-hello-arabic">
              <span>「</span>
              <span className="font-arabic">مرحبا</span>
              <span>」</span>
            </span>
            <span>HI</span>
          </div>
          <h2 className="sr-only">Contact</h2>

          <Magnetic href={`mailto:${EMAIL}`} className="site-footer-button">
            <span>Email me</span>
            <ArrowUpRight aria-hidden="true" />
          </Magnetic>
        </div>

        <div className="site-footer-bottom">
          <button type="button" onClick={copyEmail} className="site-footer-email">
            <span>{EMAIL}</span>
            <span className="site-footer-copy" aria-live="polite">
              {copied ? "Copied" : "Copy"}
            </span>
          </button>

          <ul className="site-footer-links">
            {links.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <div className="site-footer-legal">
            <span>© {new Date().getFullYear()} Youssef Chouay</span>
            <span className="font-arabic">صُنع بإتقان</span>
            <a href="#home">
              Back to top
              <ArrowUp aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
