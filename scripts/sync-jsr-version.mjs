import { readFile, writeFile } from "node:fs/promises";

const packagePath = new URL("../package.json", import.meta.url);
const jsrPath = new URL("../jsr.json", import.meta.url);
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
const jsrJson = JSON.parse(await readFile(jsrPath, "utf8"));

if (jsrJson.version !== packageJson.version) {
	jsrJson.version = packageJson.version;
	await writeFile(jsrPath, `${JSON.stringify(jsrJson, null, "\t")}\n`);
	console.log(`Updated jsr.json to ${packageJson.version}`);
}
