/**
 * Guard: landing hero animals stay wired to files that actually exist,
 * and keep the launch reveal contract (no blank, no giant FOUC flash).
 */
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

test("HeroAnimalsScene video + poster paths resolve under public/", async () => {
  const source = await readFile(
    join(root, "src/components/HeroAnimalsScene.tsx"),
    "utf8",
  );

  const video = source.match(/const VIDEO_SRC = "([^"]+)"/)?.[1];
  const poster = source.match(/const POSTER_SRC = "([^"]+)"/)?.[1];

  assert.ok(video, "VIDEO_SRC constant missing");
  assert.ok(poster, "POSTER_SRC constant missing");
  assert.ok(video.startsWith("/"), `VIDEO_SRC must be a public URL path, got ${video}`);
  assert.ok(
    poster.startsWith("/"),
    `POSTER_SRC must be a public URL path, got ${poster}`,
  );

  const posterPath = poster.split("?")[0];
  for (const urlPath of [video, posterPath]) {
    const disk = join(root, "public", urlPath.replace(/^\//, ""));
    await access(disk);
  }

  assert.match(
    source,
    /aspectRatio: "1011 \/ 720"/,
    "scene aspect must match cropped video + poster (1011×720)",
  );
});

test("HeroAnimalsScene canvas fidelity + no pre-load distortion", async () => {
  const source = await readFile(
    join(root, "src/components/HeroAnimalsScene.tsx"),
    "utf8",
  );
  const css = await readFile(
    join(root, "src/components/HeroAnimalsScene.module.css"),
    "utf8",
  );

  assert.match(source, /keyFrame\(/, "must cream-key source video for outlines");
  assert.match(source, /VIDEO_SRC/, "must use source mp4 (exact outline fidelity)");
  assert.match(
    source,
    /bufferFrozenRef/,
    "must freeze canvas bitmap after first show (no DPR flash on resize/remount paint)",
  );
  assert.match(
    source,
    /!boxReady \|\| !posterReady/,
    "scene reveal requires poster + measured box (not canvas)",
  );
  assert.match(
    source,
    /hideCanvasHard/,
    "canvas must stay hard-hidden during buffer resize",
  );
  assert.match(
    source,
    /SCENE_STYLE/,
    "inline critical box styles required (CSS-module FOUC guard)",
  );
  assert.match(
    source,
    /MAX_READY_CSS/,
    "must reject oversized layout measurements",
  );
  assert.match(
    source,
    /visibility: sceneVisible \? "visible" : "hidden"/,
    "scene must stay unpainted until poster+box settle",
  );
  assert.match(
    source,
    /requestAnimationFrame\(\(\) => \{\s*requestAnimationFrame/,
    "reveal must wait a double rAF after ready",
  );
  assert.doesNotMatch(
    source,
    /setMotionReady\(false\)/,
    "must not clear motionReady on resize",
  );
  assert.doesNotMatch(
    source,
    /width=\{390\}/,
    "must not set HTML width=390 on poster (intrinsic FOUC warp)",
  );
  assert.doesNotMatch(
    source,
    /MOTION_SRC|hero-animals-transparent\.webp/,
    "must not use lossy webp for motion (outline fidelity)",
  );
  assert.match(
    css,
    /\.poster,\s*\n\.canvas\s*\{[^}]*width:\s*100%/s,
    "canvas must CSS-fill the reserved box",
  );
  assert.doesNotMatch(
    css,
    /^\s*width:\s*auto/m,
    "canvas must not use width:auto (displays DPR buffer as CSS px)",
  );
  assert.match(
    source,
    /MOTION_FALLBACK_MS/,
    "must time out to poster if autoplay stalls",
  );
});
