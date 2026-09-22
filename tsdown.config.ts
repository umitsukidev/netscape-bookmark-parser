import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		index: "./mod.ts",
	},
	format: ["esm"],
	dts: true,
	unbundle: true,
	clean: true,
	sourcemap: true,
	outDir: "./dist",
	platform: "neutral",
	external: ["@b-fuze/deno-dom"],
});
