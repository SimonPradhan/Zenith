import type { Metadata, Viewport } from "next";
import { Bangers, Geist, Geist_Mono, Permanent_Marker } from "next/font/google";
import ServiceWorkerRegister from "./service-worker-register";
import { ToastProvider } from "./components/ui/toast-provider";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
});

const bangers = Bangers({
  variable: "--font-bangers",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zenith — Make room for what matters",
  description:
    "A warm, focused workspace for managing tasks, scheduling work, and capturing notes.",
  applicationName: "Zenith",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/zenith-icon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zenith",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3ead9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${permanentMarker.variable} ${bangers.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          {children}
          <ServiceWorkerRegister />
        </ToastProvider>
      </body>
    </html>
  );
}
