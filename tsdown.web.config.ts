import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		web: "./mod_web.ts",
	},
	format: ["esm"],
	dts: true,
	unbundle: true,
	clean: false,
	sourcemap: true,
	outDir: "./dist",
	platform: "neutral",
});
