"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.info(
          "Zenith service worker registered:",
          registration.scope,
        );
      })
      .catch((error: unknown) => {
        console.error(
          "Zenith service worker registration failed:",
          error,
        );
      });
  }, []);

  return null;
}
