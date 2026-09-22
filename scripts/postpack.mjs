import { readFile, writeFile, unlink } from "node:fs/promises";

const pkgUrl = new URL("../package.json", import.meta.url);
const pkgBackupUrl = new URL("../package.json.bak", import.meta.url);

try {
	const backup = await readFile(pkgBackupUrl, "utf8");
	await writeFile(pkgUrl, backup);
	await unlink(pkgBackupUrl);
} catch {
	// ignore if backup does not exist
}
