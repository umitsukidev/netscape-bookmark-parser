import { defineConfig } from "tsdown";
import { readFileSync } from "node:fs";

export default defineConfig({
	entry: {
		index: "./src/index.ts",
	},
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	outDir: "./dist",
	platform: "neutral",
	plugins: [
		{
			name: "wasm-binary-loader",
			load(id: string) {
				if (id.endsWith(".wasm")) {
					const buffer = readFileSync(id);
					return `
const wasmBinary = new Uint8Array([${Array.from(buffer).join(",")}]);
export default wasmBinary;
`;
				}
			},
		},
	],
});
