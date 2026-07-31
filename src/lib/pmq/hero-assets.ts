import fs from "fs";
import path from "path";

export type HeroAssetSet =
  | {
      mode: "layered";
      sky: string;
      plane: string;
      prop?: string;
    }
  | {
      mode: "wide";
      wide: string;
    }
  | {
      mode: "composed";
      plane: string;
    };

function publicExists(...segs: string[]): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", ...segs));
}

function inspoUrl(name: string): string {
  return `/brand/inspo/${name}`;
}

/**
 * Resolves hero flight assets under public/brand/inspo/.
 * Preference order:
 * 1. hero-sky-clouds.png + hero-plane.png (+ optional hero-prop.png) → layered
 * 2. hero-flight-wide.png (16:9 full scene) → wide plate + wake/scroll
 * 3. hero-flight.png → composed fallback (SVG clouds + plane crop + CSS prop)
 *
 * Optional: hero-plane.png alone is ignored until sky-clouds exists.
 */
export function resolveHeroAssets(): HeroAssetSet {
  const has = (name: string) => publicExists("brand", "inspo", name);

  if (has("hero-sky-clouds.png") && has("hero-plane.png")) {
    return {
      mode: "layered",
      sky: inspoUrl("hero-sky-clouds.png"),
      plane: inspoUrl("hero-plane.png"),
      prop: has("hero-prop.png") ? inspoUrl("hero-prop.png") : undefined,
    };
  }

  if (has("hero-flight-wide.png")) {
    return { mode: "wide", wide: inspoUrl("hero-flight-wide.png") };
  }

  return {
    mode: "composed",
    plane: inspoUrl("hero-flight.png"),
  };
}
