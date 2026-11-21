"use client";

import { useSyncExternalStore } from "react";

/**
 * Review tooling for the design drafts: a section can offer several layouts,
 * and this remembers which one is showing. Remove it, and the layouts that
 * lose, once a design is chosen.
 */

export type DraftOption<T extends string> = { id: T; label: string };

const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};
const storageKey = (section: string) => `yc-draft-${section}`;
const read = (section: string) => {
  try {
    return window.localStorage.getItem(storageKey(section));
  } catch {
    return null;
  }
};

export function useDraft<T extends string>(section: string, options: readonly DraftOption<T>[], initial: T) {
  const saved = useSyncExternalStore(
    subscribe,
    () => read(section),
    () => null,
  );
  const value = options.some((option) => option.id === saved) ? (saved as T) : initial;
  const choose = (id: T) => {
    try {
      window.localStorage.setItem(storageKey(section), id);
    } catch {
      // Private mode: the choice just does not persist.
    }
    listeners.forEach((listener) => listener());
  };
  return [value, choose] as const;
}

export function DraftSwitch<T extends string>({
  section,
  options,
  value,
  onChange,
  className = "",
}: {
  section: string;
  options: readonly DraftOption<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={`draft-switch ${className}`} role="group" aria-label={`${section} design drafts`} data-guide-skip>
      <span className="draft-switch-label">Draft</span>
      {options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={option.id === value}
          onClick={() => onChange(option.id)}
        >
          <span>{String.fromCharCode(65 + index)}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}
