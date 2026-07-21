/**
 * Generate sample JATS XML from the dummy fixture.
 * Usage: node tools/demo_jats.mjs
 * Writes: data/fixtures/dummy-article.jats.xml
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(import.meta.url);
const { generateJATS, DUMMY_JATS_ARTICLE } = require(join(ROOT, "assets/js/utils/generate-jats.js"));

const fixturePath = join(ROOT, "data/fixtures/dummy-article.json");
let article = DUMMY_JATS_ARTICLE;
try {
  article = JSON.parse(readFileSync(fixturePath, "utf8"));
} catch {
  /* use built-in dummy */
}

const xml = generateJATS(article);
const outDir = join(ROOT, "data/fixtures");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "dummy-article.jats.xml");
writeFileSync(outPath, xml, "utf8");

console.log("Wrote", outPath);
console.log("--- JATS XML (preview) ---");
console.log(xml);
