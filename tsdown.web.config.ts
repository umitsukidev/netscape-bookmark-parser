import { defineConfig } from "tsdown";
import { resolve } from "node:path";

export default defineConfig({
	entry: {
		web: "./src/web.ts",
	},
	format: ["esm"],
	dts: true,
	clean: false,
	sourcemap: true,
	outDir: "./dist",
	platform: "neutral",
	alias: {
		[resolve("src/dom.ts")]: resolve("src/web-dom.ts"),
	},
});
