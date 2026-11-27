// Writes every line the narrator needs to scripts/voice/lines.json.
// Run: node scripts/voice/export.mjs   (then: python3 scripts/voice/generate.py)
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = mkdtempSync(join(tmpdir(), 'voice-'));
const out = join(dir, 'artifacts.mjs');
await build({ entryPoints: ['src/data/artifacts.ts'], bundle: true, format: 'esm', outfile: out, logLevel: 'silent' });
const { ARTIFACTS, INFO_POINTS, ZONES } = await import(pathToFileURL(out).href);

const letters = ['A', 'B', 'C'];
const lines = {};
for (const a of ARTIFACTS) {
  const q = a.quiz;
  const opts = q.options.map((o, i) => `${letters[i]}: ${o}.`).join(' ');
  lines[`artifact-${a.id}`] = `${a.name}! ${a.fieldNote} Okay, explorer, here's your question! ${q.question} ${opts} Which one do you think it is?`;
}
for (const p of INFO_POINTS) {
  if (p.kind === 'jar') continue;
  lines[`info-${p.id}`] = `${p.title} ${p.body}`;
}
const order = ['egypt', 'nile', 'river', 'pyramid', 'tomb'];
for (const z of order) {
  const place = z === 'tomb' ? `the Great Pyramid, then go through the glowing portal into the Pharaoh's Tomb` : ZONES[z].name;
  lines[`mission-${z}`] = `Here's your mission, Time Explorer! Step into the Time Portal to travel to ${place}. Find the glowing artifacts waiting there, and answer each question to fill your backpack. When you're done, head back through the portal to come home to the Clubhouse. You can do it!`;
}
lines['mission-done'] = `Wow, you did it! Every mission is complete. You are a Master Time Explorer! I am so proud of you!`;
const correct = [
  "That's right! Amazing job! It's going in your backpack!",
  'Yes! You got it! Super smart, explorer!',
  'Correct! Fantastic work! Keep it up!',
  "Woo-hoo, that's exactly right! You're a natural!",
];
const wrong = [
  "Ooh, not quite! That's okay, give it another try!",
  "Hmm, that's not the one. You've got this, try again!",
  "Good guess, but not this time! Let's try another answer!",
];
correct.forEach((t, i) => (lines[`correct-${i + 1}`] = t));
wrong.forEach((t, i) => (lines[`wrong-${i + 1}`] = t));
lines['already'] = "You already found this one! Great memory, explorer!";
writeFileSync('scripts/voice/lines.json', JSON.stringify(lines, null, 2));
console.log(Object.keys(lines).length, 'lines');
