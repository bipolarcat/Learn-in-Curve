import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = path.join(root, "src", specifier.slice(2));
    const file = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.mjs`].find(
      (candidate) => existsSync(candidate),
    );
    if (file) {
      return nextResolve(pathToFileURL(file).href, context);
    }
  }
  return nextResolve(specifier, context);
}
