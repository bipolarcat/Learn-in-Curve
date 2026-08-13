import { PFQ_COURSE_ID } from "./constants.ts";

/**
 * Deterministic section UUIDs for PFQ objectives 1–10.
 * Must match supabase/migrations/20260813230000_pfq_lesson_sections.sql
 */
const SECTION_IDS: Record<number, string> = {
  1: "f8a2c1e0-4d3b-4a9e-9c01-2e1d0b9a8c7d",
  2: "f8a2c1e0-4d3b-4a9e-9c02-2e1d0b9a8c7d",
  3: "f8a2c1e0-4d3b-4a9e-9c03-2e1d0b9a8c7d",
  4: "f8a2c1e0-4d3b-4a9e-9c04-2e1d0b9a8c7d",
  5: "f8a2c1e0-4d3b-4a9e-9c05-2e1d0b9a8c7d",
  6: "f8a2c1e0-4d3b-4a9e-9c06-2e1d0b9a8c7d",
  7: "f8a2c1e0-4d3b-4a9e-9c07-2e1d0b9a8c7d",
  8: "f8a2c1e0-4d3b-4a9e-9c08-2e1d0b9a8c7d",
  9: "f8a2c1e0-4d3b-4a9e-9c09-2e1d0b9a8c7d",
  10: "f8a2c1e0-4d3b-4a9e-9c0a-2e1d0b9a8c7d",
};

export function pfqSectionId(objective: number): string {
  const id = SECTION_IDS[objective];
  if (!id) throw new Error(`No PFQ section id for objective ${objective}`);
  return id;
}

export function pfqCourseId(): string {
  return PFQ_COURSE_ID;
}

export { SECTION_IDS as PFQ_SECTION_IDS };
