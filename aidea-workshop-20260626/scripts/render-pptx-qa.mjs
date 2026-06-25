import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const root = path.resolve(".");
const workspace = path.join(root, "outputs", "qa", "artifact-render-workspace");
const pptxPath = path.join(root, "outputs", "aidea-workshop-20260626.pptx");
const slidesDir = path.join(root, "outputs", "qa", "slides");

function locateArtifactToolUtils() {
  const base = path.join(os.homedir(), ".codex/plugins/cache/openai-primary-runtime/presentations");
  const versions = fs.existsSync(base)
    ? fs.readdirSync(base).filter((name) => fs.existsSync(path.join(base, name, "skills/presentations/scripts/artifact_tool_utils.mjs"))).sort()
    : [];
  if (!versions.length) throw new Error(`artifact_tool_utils.mjs not found under ${base}`);
  return path.join(base, versions.at(-1), "skills/presentations/scripts/artifact_tool_utils.mjs");
}

await mkdir(slidesDir, { recursive: true });
const { ensureArtifactToolWorkspace, importArtifactTool, saveBlobToFile } = await import(pathToFileURL(locateArtifactToolUtils()));
await ensureArtifactToolWorkspace(workspace);
const artifact = await importArtifactTool(workspace);
const { FileBlob, PresentationFile } = artifact;
const presentation = await PresentationFile.importPptx(await FileBlob.load(pptxPath));
const count = presentation.slides.count;

for (let i = 0; i < count; i += 1) {
  const slide = presentation.slides.getItem(i);
  const png = await presentation.export({ slide, format: "png", scale: 1 });
  await saveBlobToFile(png, path.join(slidesDir, `slide-${String(i + 1).padStart(2, "0")}.png`));
}

const size = (await stat(pptxPath)).size;
console.log(JSON.stringify({ pptxPath, size, renderedSlides: count, slidesDir }, null, 2));
