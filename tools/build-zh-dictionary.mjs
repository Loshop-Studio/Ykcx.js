import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
const output = process.argv[3] || "ykcx.zh.dict.js";

if (!input) {
  console.error("Usage: node tools/build-zh-dictionary.mjs <OpenIME dict.txt> [output]");
  process.exit(1);
}

const entries = Object.create(null);
const syllables = new Set();
let total = 0;
let count = 0;

for (const line of fs.readFileSync(input, "utf8").split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const [key, word, rawFrequency] = line.split("\t");
  const frequency = Number(rawFrequency);
  if (!key || !word || !Number.isFinite(frequency)) continue;
  const target = entries[key] || (entries[key] = []);
  target.push(word, frequency);
  if (!key.includes(" ")) syllables.add(key);
  total += frequency;
  count += 1;
}

const data = {
  source: "OpenIME d80c32831f9a496a2c375dab404db16974531f8d",
  license: "GPL-3.0",
  entryCount: count,
  logTotal: Math.log(total),
  syllables: [...syllables].sort(),
  entries
};

const targetPath = path.resolve(output);
const source = "window.YkcxZhDictionary=" + JSON.stringify(data) + ";\n";
fs.writeFileSync(targetPath, source, "utf8");
console.log(`Wrote ${count} entries to ${targetPath} (${source.length} bytes)`);
