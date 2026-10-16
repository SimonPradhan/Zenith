"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const toastStyles: Record<ToastKind, { icon: typeof CheckCircle2; className: string }> = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-700 bg-emerald-50 text-emerald-950",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-700 bg-red-50 text-red-950",
  },
  info: {
    icon: Info,
    className: "border-[var(--comic-ink)] bg-surface text-text-primary",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const show = useCallback(
    (kind: ToastKind, message: string) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setItems((current) => [...current.slice(-3), { id, kind, message }]);
      window.setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  const toast: ToastApi = {
    success: (message) => show("success", message),
    error: (message) => show("error", message),
    info: (message) => show("info", message),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3"
      >
        <div className="sr-only" aria-live="polite" aria-atomic="false">
          {items.map((item) => item.message).join(". ")}
        </div>
        {items.map((item) => {
          const style = toastStyles[item.kind];
          const Icon = style.icon;

          return (
            <div
              key={item.id}
              role={item.kind === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex items-start gap-3 border-2 px-4 py-3 shadow-[4px_4px_0_var(--comic-ink)] ${style.className}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-sm font-semibold">{item.message}</p>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(item.id)}
                className="shrink-0 rounded-sm p-0.5 opacity-70 transition hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
