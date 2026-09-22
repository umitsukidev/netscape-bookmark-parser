import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		web: "./src/web.ts",
	},
	format: ["esm"],
	dts: {
		resolver: "tsc",
		newContext: true,
	},
	clean: false,
	sourcemap: true,
	outDir: "./dist",
	platform: "neutral",
	tsconfig: "./tsconfig.web.json",
	inputOptions: {
		resolve: {
			symlinks: false,
		},
	},
});
