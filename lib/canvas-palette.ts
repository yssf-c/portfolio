/** The theme colours a canvas drawing needs, as HSL triplets ready for `hsl(… / alpha)`. */
export type Palette = { fg: string; bg: string; gold: string };

export function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  return {
    fg: style.getPropertyValue("--foreground").trim(),
    bg: style.getPropertyValue("--background").trim(),
    gold: style.getPropertyValue("--gold").trim(),
  };
}

/** Calls `onChange` now and whenever the theme switches. Returns a cleanup function. */
export function watchPalette(onChange: (palette: Palette) => void) {
  onChange(readPalette());
  const observer = new MutationObserver(() => onChange(readPalette()));
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
