import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";
import { MemoryRouter } from "react-router";

const outputPath = new URL("../dist/index.html", import.meta.url);
const template = await readFile(outputPath, "utf8");
const vite = await createServer({
  root: fileURLToPath(new URL("..", import.meta.url)),
  configFile: fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
  configLoader: "runner",
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const { default: Landing } = await vite.ssrLoadModule("/src/pages/Landing.tsx");
  const markup = renderToString(
    h(MemoryRouter, null, h(Landing)),
  );
  const html = template
    .replace(/<div id="root"><\/div>/, `<div id="root">${markup}</div>`)
    .replace(/\s*<script[^>]*type="module"[^>]*><\/script>/g, "")
    .replace(/\s*<link[^>]*rel="modulepreload"[^>]*>/g, "");
  await writeFile(outputPath, html);
} finally {
  await vite.close();
}
