#!/usr/bin/env node
// Regenerates content/v2/DIAGRAM_REGISTER.md from every content/v2/loN.json.
// Run after authoring or editing any LO:  node scripts/build-diagram-register.mjs
// Never hand-edit DIAGRAM_REGISTER.md — it is derived, and will be overwritten.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'content', 'v2');
const OUT = join(DIR, 'DIAGRAM_REGISTER.md');

const files = readdirSync(DIR)
  .filter((f) => /^lo\d+\.json$/.test(f))
  .sort((a, b) => parseInt(a.slice(2), 10) - parseInt(b.slice(2), 10));

const rows = [];
const authored = [];

for (const f of files) {
  const lo = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  authored.push(lo.lo_number);
  for (const section of lo.core_content ?? []) {
    for (const d of section.diagrams ?? []) {
      rows.push({
        lo: lo.lo_number,
        loTitle: lo.title,
        sub: section.outcome_code,
        fig: d.figure_number ?? '',
        id: d.id ?? '',
        caption: d.caption ?? '',
        heading: d.heading ?? '',
        status: d.file ? 'SUPPLIED' : 'PLACEHOLDER',
        file: d.file ?? '',
        spec: (d.spec ?? '').replace(/\n/g, ' ').replace(/\|/g, '\\|'),
        alt: (d.alt ?? '').replace(/\n/g, ' ').replace(/\|/g, '\\|'),
      });
    }
  }
}

const placeholders = rows.filter((r) => r.status === 'PLACEHOLDER');
const supplied = rows.filter((r) => r.status === 'SUPPLIED');
const missing = [];
for (let i = 1; i <= 24; i += 1) if (!authored.includes(i)) missing.push(i);

const esc = (s) => String(s).replace(/\|/g, '\\|');

let md = `# Diagram register — v2 content

**Generated file. Do not edit by hand.** Regenerate with:

\`\`\`
node scripts/build-diagram-register.mjs
\`\`\`

Last generated: ${new Date().toISOString().slice(0, 10)}

| | Count |
|---|---|
| LOs authored | ${authored.length} of 24 |
| Diagrams total | ${rows.length} |
| Supplied (asset exists) | ${supplied.length} |
| Placeholders (awaiting artwork) | ${placeholders.length} |

${missing.length ? `**Not yet authored:** LO ${missing.join(', ')}. The full diagram set is incomplete until these land.\n` : '**All 24 LOs authored.** This register is complete.\n'}
---

## Awaiting artwork

Each row is a slot in the content that expects a diagram. Draw against the spec; the caption and
alt text are already written and will be used as-is.

| LO | Fig | ID | Caption | Sits under heading | Spec |
|---|---|---|---|---|---|
${placeholders
  .map(
    (r) =>
      `| ${r.lo} | ${r.fig} | \`${r.id}\` | ${esc(r.caption)} | ${esc(r.heading)} (${r.sub}) | ${r.spec} |`,
  )
  .join('\n')}

---

## Supplied

| LO | Fig | ID | Caption | File |
|---|---|---|---|---|
${
  supplied.length
    ? supplied
        .map((r) => `| ${r.lo} | ${r.fig} | \`${r.id}\` | ${esc(r.caption)} | \`${r.file}\` |`)
        .join('\n')
    : '| — | — | — | _none yet_ | — |'
}

---

## Alt text

Accessibility text for every diagram, supplied and placeholder. Required on publish.

| ID | Alt |
|---|---|
${rows.map((r) => `| \`${r.id}\` | ${r.alt} |`).join('\n')}

---

## Reconciling diagrams you have drawn

Two directions to check whenever a batch of artwork arrives:

1. **Artwork matches a placeholder** — set that diagram's \`file\` to the asset path in the LO
   JSON, then regenerate this register. The row moves from Awaiting artwork to Supplied.
2. **Artwork has no placeholder** — decide which LO and which body heading it belongs under, add a
   diagram object there with \`id\`, \`figure_number\`, \`caption\`, \`placement\`, \`heading\`,
   \`file\`, \`alt\`, and renumber that LO's figures in reading order.

A placeholder that will not be drawn should be deleted from the LO JSON, not left sitting in this
list — the body content it supports may need a table instead.
`;

writeFileSync(OUT, md);
console.log(
  `Wrote ${OUT}\n  ${authored.length}/24 LOs, ${rows.length} diagrams (${supplied.length} supplied, ${placeholders.length} placeholder)`,
);
