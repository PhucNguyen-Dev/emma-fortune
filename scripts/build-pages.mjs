import { spawnSync } from "node:child_process";

/** Builds the static export for GitHub Pages: out/ under /emma-fortune/. */
process.env.NEXT_OUTPUT = "export";
process.env.NEXT_PUBLIC_BASE_PATH = "/emma-fortune";

const result = spawnSync("pnpm", ["exec", "next", "build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
