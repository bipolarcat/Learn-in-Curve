import { readFileSync, existsSync } from "fs";
import { join } from "path";

const CONTENT_DIR = join(process.cwd(), "PMQ in 5 days", "content");

export type LoTutorContent = {
  lo_number: number;
  lo_code: string;
  title: string;
  theme: string;
  apm_learning_objective: string;
  learning_outcomes: string[];
  key_definitions: { term: string; definition: string }[];
  misconceptions: { myth: string; reality: string }[];
  exam_technique: {
    command_words?: Record<string, string>;
    tips?: string[];
  };
  quick_recap: string[];
};

export function loadLoContent(loNumber: number): LoTutorContent | null {
  const filePath = join(CONTENT_DIR, `lo${loNumber}.json`);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf8")) as LoTutorContent;
}
