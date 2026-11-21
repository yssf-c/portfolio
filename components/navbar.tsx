"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  FileText,
  Monitor,
  Moon,
  Sun,
  Home,
  UserRound,
  GraduationCap,
  BriefcaseBusiness,
  FolderGit2,
} from "lucide-react";
import { Glass } from "@/components/glass";

const navLinks = [
  { href: "#home", label: "HOME", arabic: "الرئيسية", icon: Home },
  { href: "#about", label: "INFO", arabic: "معلومات", icon: UserRound },
  {
    href: "#education",
    label: "EDUCATION",
    arabic: "تعليم",
    icon: GraduationCap,
  },
  {
    href: "#experience",
    label: "EXPERIENCE",
    arabic: "خبرة",
    icon: BriefcaseBusiness,
  },
  { href: "#work", label: "WORKS", arabic: "أعمال", icon: FolderGit2 },
];

const themeCycle = ["system", "light", "dark"] as const;

function ThemeToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme =
    mounted && themeCycle.includes(theme as (typeof themeCycle)[number])
      ? (theme as (typeof themeCycle)[number])
      : "system";
  const nextTheme =
    themeCycle[(themeCycle.indexOf(currentTheme) + 1) % themeCycle.length];
  const Icon =
    currentTheme === "light" ? Sun : currentTheme === "dark" ? Moon : Monitor;
  const label = currentTheme[0].toUpperCase() + currentTheme.slice(1);
  const nextLabel = nextTheme[0].toUpperCase() + nextTheme.slice(1);
  const ariaLabel = mounted
    ? `Theme: ${label}. Switch to ${nextLabel}.`
    : "Theme";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={`inline-flex h-9 w-9 items-center justify-center text-foreground/80 transition-colors duration-300 hover:text-gold focus-visible:text-gold ${className}`}
      aria-label={ariaLabel}
      title={mounted ? `Theme: ${label}` : "Theme"}
    >
      {mounted ? <Icon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = ["home", "about", "education", "experience", "work"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const closeMenuAbovePhone = () => {
      if (window.innerWidth >= 640) setMobileMenuOpen(false);
    };

    window.addEventListener("resize", closeMenuAbovePhone);
    return () => window.removeEventListener("resize", closeMenuAbovePhone);
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isHome || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      window.history.pushState(null, "", href);
    }

    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* A floating glass pill; the lens under the current section slides between links */}
      <header className="nav-shell" data-scrolled={scrolled ? "" : undefined}>
        <Glass className="nav-pill">
          <Link href="/" className="nav-pill-logo">
            YCAY
          </Link>

          <nav className="nav-pill-links" aria-label="Primary navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isHome && activeSection === link.href.replace("#", "");

              return (
                <a
                  key={link.href}
                  href={isHome ? link.href : `/${link.href}`}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="nav-pill-link"
                  data-active={isActive ? "" : undefined}
                  aria-current={isActive ? "location" : undefined}
                  aria-label={link.label}
                  title={link.label}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-lens"
                      className="nav-pill-lens"
                      transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.9 }}
                    />
                  )}
                  <Icon className="nav-pill-icon" aria-hidden="true" />
                  <span className="nav-pill-label">{link.label}</span>
                </a>
              );
            })}

            <a
              href="/data/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-pill-link"
              aria-label="CV"
              title="CV"
            >
              <FileText className="nav-pill-icon nav-pill-icon-always" aria-hidden="true" />
              <span className="nav-pill-label">CV</span>
            </a>
          </nav>

          <span className="nav-pill-rule" aria-hidden="true" />
          <ThemeToggle className="nav-pill-button" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nav-pill-button nav-pill-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </Glass>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-background text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex min-h-full flex-col items-center justify-center px-6 py-24">
              <nav className="flex flex-col items-center space-y-6">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <a
                      href={isHome ? link.href : `/${link.href}`}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="flex flex-col items-center group"
                    >
                      <span className="text-3xl font-light text-foreground tracking-wider transition-colors group-hover:text-gold">
                        {link.label}
                      </span>
                      <span className="font-arabic text-base text-[hsl(var(--gold))] mt-1">
                        {link.arabic}
                      </span>
                    </a>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  <a
                    href="/data/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center group"
                  >
                    <span className="text-3xl font-light text-foreground tracking-wider transition-colors group-hover:text-gold">
                      CV
                    </span>
                    <span className="font-arabic text-base text-[hsl(var(--gold))] mt-1">
                      السيرة
                    </span>
                  </a>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: (navLinks.length + 1) * 0.1 }}
                  className="pt-4"
                >
                  <ThemeToggle className="h-11 w-11" />
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
