import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const outDir = resolve(root, "screenshots");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });

await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: resolve(outDir, "executive-overview.png"), fullPage: true });

await page.getByRole("button", { name: "Deployment Blueprints" }).click();
await page.evaluate(() => window.scrollTo(0, 0));
await page.getByRole("button", { name: "Generate Blueprint" }).click();
await page.waitForSelector("text=CustomerEnvironmentBlueprint");
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: resolve(outDir, "deployment-blueprints.png"), fullPage: true });

await page.getByRole("button", { name: "Support Runbooks" }).click();
await page.evaluate(() => window.scrollTo(0, 0));
await page.getByRole("button", { name: "Triage Case" }).click();
await page.getByRole("button", { name: "Recommend Runbook" }).click();
await page.waitForSelector("text=Runbook Recommendation");
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: resolve(outDir, "support-runbooks.png"), fullPage: true });

await browser.close();
