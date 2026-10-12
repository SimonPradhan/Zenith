import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Zenith — Notes & Tasks",
    short_name: "Zenith",
    description: "A focused workspace for managing tasks, scheduling work, and capturing notes.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#09090b",
    theme_color: "#8b5cf6",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/zenith-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/zenith-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
