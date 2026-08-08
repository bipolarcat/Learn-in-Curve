import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";
import { GrainOverlay } from "@/components/GrainOverlay";
import { IntercomProvider } from "@/components/IntercomProvider";
import { ThemeRoutePolicy } from "@/components/ThemeRoutePolicy";
import { CookieBanner } from "@/components/CookieBanner";
import { PostHogProvider } from "@/components/PostHogProvider";
import { AttributionCapture } from "@/components/analytics/AttributionCapture";
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
        {/*
          Theme resolution, before first paint.

          Blocking and inline on purpose: anything that resolves after
          hydration shows a flash of the wrong theme on every load, and on a
          public page (always light) a dark-mode user would get a dark flash
          before it corrected.

          Reads the `lic_theme` cookie and nothing else. It must never consult
          `prefers-color-scheme` — that fallback is what opened the dashboard in
          dark mode for a user who had never asked for it (LIC-107). Middleware
          deletes the cookie whenever there is no session, so this also can't
          apply a signed-out user's leftover preference.

          Kept as a hand-written string rather than importing from
          theme-routes.ts because it has to run before any bundle loads; the
          route test here and `allowsDarkMode` there must be changed together.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;function light(){d.classList.remove('dark');d.style.colorScheme='only light';}try{var p=location.pathname||'';if(!(/^\\/dashboard\\/?$/.test(p)||/^\\/courses\\/pmq-in-5-days\\/lo\\/[^/]+\\/?$/.test(p))){light();return;}var m=document.cookie.match(/(?:^|;\\s*)lic_theme=([^;]*)/);if(!m||m[1]!=='dark'){light();return;}d.classList.add('dark');d.style.colorScheme='only dark';}catch(e){light();}})();`,
          }}
        />
        {/*
          Entrance animations must not be able to hide content (LIC-113).

          A document that loads while hidden — a link opened in a background
          tab, a browser prerender, an app switch mid-load — never advances
          `document.timeline`. Its animations sit at currentTime 0 forever, and
          any of them declared `animation-fill-mode: both` therefore pins its
          element at the *from* keyframe. The header's `header-chip-in` starts
          at `opacity: 0`, so the header controls rendered invisible and stayed
          that way until a reload that happened to occur while the tab was
          visible. That is the whole "intermittent, reload fixes it, only on
          mobile" shape: phones background documents constantly, and devtools
          emulation keeps the document visible, which is why it never
          reproduced there.

          Reproduced directly: with visibilityState 'hidden',
          document.timeline.currentTime was 0, the animation playState was
          "running" with currentTime 0, and the chip's computed opacity was 0.

          The fix is aimed exactly at that mechanism rather than at the symptom:
          while the document has never been visible, entrance animations are
          held off, so every element renders at its own base style — which is
          visible. Once the page is actually shown the class is dropped and the
          animations start and play normally, so the entrance is deferred rather
          than lost. No timeout, no forced re-render, nothing that would paper
          over a recurrence.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(document.visibilityState==='visible')return;var d=document.documentElement,c='lic-deferred-entrance';d.classList.add(c);var on=function(){if(document.visibilityState!=='visible')return;d.classList.remove(c);document.removeEventListener('visibilitychange',on);};document.addEventListener('visibilitychange',on);}catch(e){document.documentElement.classList.remove('lic-deferred-entrance');}})();`,
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
        {/*
          PostHog wraps children so route changes are visible to it, but it
          loads nothing until cookie consent is granted — see PostHogProvider.
        */}
        <PostHogProvider>
          <AttributionCapture />
          {children}
        </PostHogProvider>
        <CookieBanner />
        <GrainOverlay />
        <AppToaster />
        <IntercomProvider />
      </body>
    </html>
  );
}
