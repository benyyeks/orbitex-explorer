// ORBITEX Theme Controller
// Defaults to the visitor's OS preference (prefers-color-scheme). A manual
// choice from the toggle button is persisted in localStorage and takes
// priority over the OS setting until the visitor clears it.

const STORAGE_KEY = "orbitex-theme";

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

export function applyTheme(theme: Theme | null) {
  const root = document.documentElement;
  if (theme === "light" || theme === "dark") {
    root.setAttribute("data-theme", theme);
  } else {
    root.removeAttribute("data-theme");
  }
}

export function setTheme(theme: Theme | null) {
  try {
    if (theme) localStorage.setItem(STORAGE_KEY, theme);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* localStorage unavailable; theme just won't persist */
  }
  applyTheme(theme);
}

export function currentEffectiveTheme(): Theme {
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function toggleTheme(): Theme {
  const next: Theme = currentEffectiveTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

// Inlined as a blocking script in the root layout head (before the stylesheet)
// so the stored override applies before first paint and there is no flash.
export const THEME_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");if(s==="light"||s==="dark"){document.documentElement.setAttribute("data-theme",s);}}catch(e){}})();`;
