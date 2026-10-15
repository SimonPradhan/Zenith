export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "zenith_theme";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return preference;
}

/**
 * Runs in <head> before the first paint so the correct theme is applied
 * before React hydrates. This prevents a flash of the wrong theme.
 * Keep it dependency-free and wrapped in try/catch.
 */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var preference =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "${DEFAULT_THEME_PREFERENCE}";
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme =
      preference === "system" ? (prefersDark ? "dark" : "light") : preference;
    var root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;
