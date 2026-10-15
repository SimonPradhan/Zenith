"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

import { getToken } from "@/lib/auth";
import {
  getDashboardPreferences,
  saveDashboardPreferences,
} from "@/lib/api/dashboard-preferences";
import {
  DEFAULT_THEME_PREFERENCE,
  THEME_STORAGE_KEY,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

/* ------------------------------------------------------------------ */
/* Stored preference (local storage) as an external store              */
/* ------------------------------------------------------------------ */

const preferenceListeners = new Set<() => void>();

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    return isThemePreference(stored) ? stored : DEFAULT_THEME_PREFERENCE;
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
}

function storePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Ignore local storage availability errors.
  }

  preferenceListeners.forEach((listener) => listener());
}

function subscribeToPreference(callback: () => void) {
  preferenceListeners.add(callback);

  // Keeps several open tabs in sync.
  window.addEventListener("storage", callback);

  return () => {
    preferenceListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerPreference(): ThemePreference {
  return DEFAULT_THEME_PREFERENCE;
}

/* ------------------------------------------------------------------ */
/* Operating system color scheme as an external store                  */
/* ------------------------------------------------------------------ */

function subscribeToSystemTheme(callback: () => void) {
  const media = window.matchMedia(SYSTEM_DARK_QUERY);

  media.addEventListener("change", callback);

  return () => media.removeEventListener("change", callback);
}

function getSystemPrefersDark(): boolean {
  return window.matchMedia(SYSTEM_DARK_QUERY).matches;
}

function getServerSystemPrefersDark(): boolean {
  return true;
}

/* ------------------------------------------------------------------ */
/* "Is this running in the browser after hydration?"                   */
/* ------------------------------------------------------------------ */

function subscribeNever() {
  return () => {};
}

/* ------------------------------------------------------------------ */

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useSyncExternalStore(
    subscribeToPreference,
    readStoredPreference,
    getServerPreference,
  );

  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemPrefersDark,
    getServerSystemPrefersDark,
  );

  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  // Set once the user picks a theme, so a slower backend response
  // never overrides a choice made after the page loaded.
  const changedByUser = useRef(false);

  const resolvedTheme = useMemo(
    () => resolveTheme(preference, systemPrefersDark),
    [preference, systemPrefersDark],
  );

  // Sync from the backend so the theme follows the account across
  // devices. State is only updated inside the promise callback.
  useEffect(() => {
    const token = getToken();

    if (!token) {
      return;
    }

    let cancelled = false;

    getDashboardPreferences(token)
      .then((response) => {
        if (cancelled || changedByUser.current) {
          return;
        }

        const remote: unknown = response.preferences.theme;

        if (isThemePreference(remote)) {
          storePreference(remote);
        }
      })
      .catch((error) => {
        console.error("Failed to load theme preference:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Update the DOM. The inline script in <head> handles first paint;
  // this keeps the attribute in sync afterwards. Waiting for mount
  // prevents the hydration default from overwriting the script's value.
  useEffect(() => {
    if (mounted) {
      applyTheme(resolvedTheme);
    }
  }, [mounted, resolvedTheme]);

  const setPreference = useCallback((next: ThemePreference) => {
    changedByUser.current = true;

    storePreference(next);

    const token = getToken();

    if (!token) {
      return;
    }

    saveDashboardPreferences(token, { theme: next }).catch((error) => {
      console.error("Failed to save theme preference:", error);
    });
  }, []);

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference, mounted }),
    [preference, resolvedTheme, setPreference, mounted],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
