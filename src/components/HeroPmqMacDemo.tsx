"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "@/components/HeroPmqMacDemo.module.css";

const WALKTHROUGH = [
  { id: "overview", duration: 1400 },
  { id: "open-lo", duration: 900 },
  { id: "orient", duration: 1450 },
  { id: "learn", duration: 1350 },
  { id: "practice", duration: 900 },
  { id: "answer", duration: 1100 },
  { id: "correct", duration: 1550 },
  { id: "complete", duration: 1550 },
] as const;

type WalkthroughScene = (typeof WALKTHROUGH)[number]["id"];

/** Pathway labels match live `lo-stages.ts` (practice stage = Quiz). */
const PATHWAY = [
  "Orient",
  "Learn",
  "Video",
  "Audio",
  "Apply",
  "Quiz",
  "Checkpoint",
] as const;

const DAY1_LOS = [
  { n: 1, title: "Life cycles" },
  { n: 2, title: "Governance Arrangements" },
  { n: 3, title: "Sustainability" },
  { n: 4, title: "Business Case" },
  { n: 5, title: "Procurement" },
] as const;

const CURSOR_POSITIONS: Record<
  WalkthroughScene,
  { x: string; y: string; visible: boolean; clicking?: boolean }
> = {
  overview: { x: "86%", y: "28%", visible: false },
  "open-lo": { x: "78%", y: "52%", visible: true, clicking: true },
  orient: { x: "24%", y: "28%", visible: false },
  learn: { x: "22%", y: "36%", visible: true, clicking: true },
  practice: { x: "72%", y: "36%", visible: true, clicking: true },
  answer: { x: "48%", y: "78%", visible: true, clicking: true },
  correct: { x: "48%", y: "78%", visible: false },
  complete: { x: "86%", y: "28%", visible: false },
};

export function HeroPmqMacDemo() {
  const rootRef = useRef<HTMLElement>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const scene = reducedMotion ? "overview" : WALKTHROUGH[sceneIndex].id;
  const cursor = CURSOR_POSITIONS[scene];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReducedMotion(media.matches);
      if (media.matches) setSceneIndex(0);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { threshold: 0.3 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => setPageVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (!inView || !pageVisible || reducedMotion || paused) return;
    const timer = window.setTimeout(() => {
      setSceneIndex((current) => (current + 1) % WALKTHROUGH.length);
    }, WALKTHROUGH[sceneIndex].duration);
    return () => window.clearTimeout(timer);
  }, [inView, pageVisible, paused, reducedMotion, sceneIndex]);

  return (
    <figure
      ref={rootRef}
      className={styles.mac}
      aria-label="Animated preview of the PMQ in 5 Days course, from the 5-day plan to a completed practice question"
      data-scene={scene}
      data-paused={paused || reducedMotion || !inView || !pageVisible}
    >
      <div className={styles.screen}>
        <div className={styles.screenInner} aria-hidden>
          <MiniHeader scene={scene} />
          <div key={scene} className={styles.scene}>
            {scene === "overview" || scene === "open-lo" ? (
              <OverviewScene complete={false} />
            ) : scene === "complete" ? (
              <OverviewScene complete />
            ) : (
              <LoScene scene={scene} />
            )}
          </div>
          <span
            className={`${styles.cursor} ${cursor.clicking ? styles.cursorClick : ""}`}
            style={{
              left: cursor.x,
              top: cursor.y,
              opacity: cursor.visible ? 1 : 0,
            }}
          >
            <CursorGlyph />
          </span>
        </div>
      </div>

      <Image
        src="/brand/inspo/mac-screen-transparent.webp"
        alt=""
        fill
        priority
        quality={95}
        sizes="(min-width: 1024px) 34rem, (min-width: 640px) 26rem, 22rem"
        className={styles.frame}
        aria-hidden
      />
      {!reducedMotion ? (
        <button
          type="button"
          className={styles.pauseButton}
          onClick={() => setPaused((current) => !current)}
          aria-label={paused ? "Play PMQ walkthrough" : "Pause PMQ walkthrough"}
          aria-pressed={paused}
        >
          <span className={styles.pauseIcon} aria-hidden>
            {paused ? (
              <span className={styles.playGlyph} />
            ) : (
              <>
                <span />
                <span />
              </>
            )}
          </span>
        </button>
      ) : null}
    </figure>
  );
}

function MiniHeader({ scene }: { scene: WalkthroughScene }) {
  const onLo = !["overview", "open-lo", "complete"].includes(scene);
  const pct = scene === "complete" ? 1 : onLo ? 1 : 0;

  return (
    <div className={styles.miniHeader}>
      {onLo ? (
        <>
          <span className={styles.headerCrumb}>
            <span className={styles.overviewLink}>Overview</span>
            <span className={styles.crumbPipe} aria-hidden>
              |
            </span>
            <span>
              <b>LO 1</b>
              <span className={styles.crumbDot} aria-hidden>
                ·
              </span>
              Life cycles
            </span>
          </span>
          <span className={styles.nextPill}>Next</span>
        </>
      ) : (
        <>
          <span className={styles.miniBrand}>
            PMQ in <span>5 Days</span>
          </span>
          <span className={styles.miniPills}>
            <span className={styles.streakChip}>
              <FlameGlyph />
              {scene === "complete" ? "1" : "0"}
            </span>
            <span className={styles.pctChip}>{pct}%</span>
          </span>
        </>
      )}
    </div>
  );
}

function OverviewScene({ complete }: { complete: boolean }) {
  return (
    <div className={styles.overview}>
      <div className={styles.planConsole}>
        <div className={styles.titleBar}>
          <p className={styles.planTitle}>
            Your <span className="text-orange">5-day</span> plan
          </p>
          <span className={styles.continuePill}>
            {complete ? "Continue" : "Start"}
          </span>
        </div>

        <div className={styles.dayRail}>
          {[1, 2, 3, 4, 5].map((day) => {
            const selected = day === 1;
            const count =
              day === 1 ? (complete ? "1/5" : "0/5") : day === 2 ? "0/5" : "0/5";
            return (
              <span
                key={day}
                className={`${styles.dayTab} ${selected ? styles.dayTabSelected : ""} ${
                  complete && day === 1 ? styles.dayTabProgress : ""
                }`}
              >
                <em>Day {day}</em>
                <i>{count}</i>
              </span>
            );
          })}
        </div>

        <div className={styles.loList}>
          {DAY1_LOS.map((lo, index) => {
            const done = complete && lo.n === 1;
            const pie = !done && lo.n === 1 && complete === false;
            return (
              <div
                key={lo.n}
                className={`${styles.loRow} ${done ? styles.loRowDone : ""} ${
                  index === 0 ? styles.loRowFocus : ""
                }`}
              >
                <span className={styles.loNum}>{lo.n}</span>
                <span className={styles.loTitle}>{lo.title}</span>
                {done ? (
                  <span className={styles.loCheck}>✓</span>
                ) : pie ? (
                  <span className={styles.loPie} />
                ) : (
                  <span className={styles.loPieEmpty} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LoScene({
  scene,
}: {
  scene: Exclude<WalkthroughScene, "overview" | "open-lo" | "complete">;
}) {
  const active =
    scene === "orient"
      ? "Orient"
      : scene === "learn"
        ? "Learn"
        : "Quiz";

  return (
    <div className={styles.loView}>
      <div className={styles.path}>
        {PATHWAY.map((stage) => {
          const isActive = stage === active;
          const isDone = PATHWAY.indexOf(stage) < PATHWAY.indexOf(active);
          return (
            <span
              key={stage}
              className={`${styles.pathStep} ${
                isActive ? styles.pathActive : isDone ? styles.pathDone : ""
              }`}
            >
              <i>{isDone ? "✓" : stage.slice(0, 1)}</i>
              <em>{stage}</em>
            </span>
          );
        })}
      </div>
      {scene === "orient" ? (
        <OrientPanel />
      ) : scene === "learn" ? (
        <LearnPanel />
      ) : (
        <PracticePanel correct={scene === "correct"} />
      )}
    </div>
  );
}

function OrientPanel() {
  return (
    <div className={styles.cardStack}>
      <div className={styles.contentPanel}>
        <div className={styles.panelHeading}>
          <span className={styles.glyph}>◎</span>
          <strong>Context</strong>
        </div>
        <p className={styles.bodyCopy}>
          How projects, programmes and portfolios connect to organisational
          strategy.
        </p>
      </div>
      <div className={styles.contentPanelCompact}>
        <div className={styles.panelHeading}>
          <span className={styles.glyph}>☰</span>
          <strong>Learning outcomes</strong>
        </div>
        <div className={styles.outcomeRows}>
          <span>
            <b>1a</b> Distinguish life-cycle phases
          </span>
          <span>
            <b>1b</b> Choose an appropriate approach
          </span>
        </div>
      </div>
    </div>
  );
}

function LearnPanel() {
  return (
    <div className={styles.contentPanel}>
      <div className={styles.panelHeading}>
        <span className={styles.glyph}>▤</span>
        <strong>Key definitions</strong>
      </div>
      <div className={styles.definitionRows}>
        <span>
          <b>Project</b>
          <i>A unique, transient endeavour</i>
        </span>
        <span>
          <b>Programme</b>
          <i>Related projects managed together</i>
        </span>
        <span>
          <b>Portfolio</b>
          <i>Change aligned to strategy</i>
        </span>
      </div>
    </div>
  );
}

function PracticePanel({ correct }: { correct: boolean }) {
  return (
    <div className={styles.quizPanel}>
      <div className={styles.quizHeader}>
        <span className={styles.glyph}>▦</span>
        <strong>Practise quiz</strong>
      </div>
      <p className={styles.quizHint}>One try per question. Review anytime.</p>
      <div className={styles.setRail}>
        <span className={styles.setPillActive}>1</span>
        <span className={styles.setMore}>+2 more</span>
      </div>
      <p className={styles.question}>
        Which term means a unique, transient endeavour?
      </p>
      <div className={styles.options}>
        <span>A · Business as usual</span>
        <span className={correct ? styles.correctOption : ""}>
          B · Project {correct ? "✓" : ""}
        </span>
        <span>C · Portfolio</span>
      </div>
      {correct ? (
        <p className={styles.feedback}>
          Correct — projects have a defined start and finish.
        </p>
      ) : null}
    </div>
  );
}

function FlameGlyph() {
  return (
    <svg viewBox="0 0 16 16" className={styles.flameIcon} aria-hidden>
      <path
        d="M8 1.5c.4 2.2-.6 3.4-1.6 4.5C5.2 7.2 4 8.6 4 10.4a4 4 0 0 0 8 0c0-2.4-1.5-3.6-2.6-5C8.5 4.4 7.7 3.2 8 1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CursorGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4.7 3.8 19 12.2l-6.2 1.3-3.1 5.3L4.7 3.8Z"
        fill="#FBF3E1"
        stroke="#241A12"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
