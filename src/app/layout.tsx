import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";
import { GrainOverlay } from "@/components/GrainOverlay";
import { IntercomProvider } from "@/components/IntercomProvider";
import { ThemeRoutePolicy } from "@/components/ThemeRoutePolicy";
import { CookieBanner } from "@/components/CookieBanner";
import { AppToaster } from "@/components/ui/toast";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Learn in Curve - Master Project Management and AI",
  description:
    "Interactive exam revision for project management certifications. Start with PMQ in 5 days.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${figtree.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Dark Reader opt-out. The extension rewrites inline styles on every
          element before React hydrates (data-darkreader-inline-*), which both
          breaks hydration and inverts our cream/warm palette. This meta tag is
          Dark Reader's official lock (v4.9.63+) and makes it skip the site
          entirely — we already ship our own light/dark themes.
        */}
        <meta name="darkreader-lock" content="" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement,p=location.pathname||'',a=/^\\/dashboard\\/?$/.test(p)||/^\\/courses\\/pmq-in-5-days\\/?$/.test(p)||/^\\/courses\\/pmq-in-5-days\\/lo\\/[^/]+\\/?$/.test(p);if(!a){d.classList.remove('dark');d.style.colorScheme='only light';return;}var t=localStorage.getItem('theme'),x=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.classList.toggle('dark',x);d.style.colorScheme=x?'only dark':'only light';}catch(e){document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='only light';}})();`,
          }}
        />
      </head>
      {/*
        Intercom, mobile password managers and in-app browsers all decorate
        <body> with their own attributes before React hydrates, which surfaces
        as an attribute mismatch we can neither predict nor control. Same
        reasoning as the <html> opt-out above; children still hydrate normally.
      */}
      <body className="min-h-screen" suppressHydrationWarning>
        <ThemeRoutePolicy />
        {children}
        <CookieBanner />
        <GrainOverlay />
        <AppToaster />
        <IntercomProvider />
      </body>
    </html>
  );
}
