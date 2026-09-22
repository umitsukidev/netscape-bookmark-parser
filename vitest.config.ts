import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		setupFiles: ["./src/node-dom.ts"],
	},
});
