"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/app/context/theme-context";
import type { ThemePreference } from "@/lib/theme";

const OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
];

export default function ThemeToggle() {
  const { preference, setPreference, mounted } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center rounded-lg border border-border bg-surface p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        // Avoid highlighting the default before the stored value is read.
        const active = mounted && preference === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} theme`}
            title={label}
            onClick={() => setPreference(value)}
            className={`rounded-md p-1.5 transition ${
              active
                ? "bg-primary/10 text-primary"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Icon size={15} />
          </button>
        );
      })}
    </div>
  );
}
