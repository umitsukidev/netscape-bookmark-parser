import { readFile, writeFile } from "node:fs/promises";

const pkgUrl = new URL("../package.json", import.meta.url);
const pkgBackupUrl = new URL("../package.json.bak", import.meta.url);

const raw = await readFile(pkgUrl, "utf8");
await writeFile(pkgBackupUrl, raw);

const pkg = JSON.parse(raw);
// Remove JSR dependencies from packaged npm tarball because they are bundled by tsdown
if (pkg.dependencies) {
	delete pkg.dependencies["@b-fuze/deno-dom"];
	if (Object.keys(pkg.dependencies).length === 0) {
		delete pkg.dependencies;
	}
}

await writeFile(pkgUrl, JSON.stringify(pkg, null, "\t") + "\n");
