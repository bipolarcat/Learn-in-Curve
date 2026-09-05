import {
  isPfqTrapTag,
  TRAP_TAG_TO_MODULE,
  type PfqTrapTag,
} from "./trap-tags.ts";
import { PFQ_TRAP_SCHOOL } from "./trap-school-content.ts";
import { PFQ_TRAP_SCHOOL_HREF } from "./constants.ts";

export type PfqTrapCalloutContent = {
  tag: PfqTrapTag;
  moduleId: (typeof TRAP_TAG_TO_MODULE)[PfqTrapTag];
  title: string;
  body: string;
  href: string;
};

/**
 * Pick exactly one trap callout. Priority follows TRAP_TAG_TO_MODULE key order:
 * near_miss > negative_stem > multi_select.
 */
export function resolveTrapCallout(
  traps: string[] | null | undefined,
): PfqTrapCalloutContent | null {
  if (!Array.isArray(traps) || traps.length === 0) return null;

  const present = new Set(
    traps.filter((t): t is PfqTrapTag => isPfqTrapTag(t)),
  );
  if (present.size === 0) return null;

  for (const tag of Object.keys(TRAP_TAG_TO_MODULE) as PfqTrapTag[]) {
    if (!present.has(tag)) continue;
    const moduleId = TRAP_TAG_TO_MODULE[tag];
    const trapModule = PFQ_TRAP_SCHOOL.traps.find((t) => t.id === moduleId);
    if (!trapModule || !("whatToDo" in trapModule) || !trapModule.whatToDo) {
      continue;
    }
    return {
      tag,
      moduleId,
      title: trapModule.title,
      body: trapModule.whatToDo,
      href: `${PFQ_TRAP_SCHOOL_HREF}#${moduleId}`,
    };
  }
  return null;
}
