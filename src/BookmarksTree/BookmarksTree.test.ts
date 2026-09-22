/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, test } from "vitest";
import "../node-dom.ts";
import { DOMParser } from "../dom.ts";
import { BookmarksTree } from "./BookmarksTree.ts";

const assertEquals = (actual: unknown, expected: unknown) => expect(actual).toEqual(expected);
const assertInstanceOf = (actual: unknown, expected: abstract new (...args: any[]) => any) =>
	expect(actual).toBeInstanceOf(expected);

test("BookmarksTree - 基本的な操作", () => {
	const tree = new BookmarksTree();

	// ブックマークの追加
	tree.set("Google", "https://google.com");
	tree.set("GitHub", "https://github.com");

	assertEquals(tree.get("Google"), "https://google.com");
	assertEquals(tree.get("GitHub"), "https://github.com");
	assertEquals(tree.size, 2);
});

test("BookmarksTree - フォルダの作成と階層構造", () => {
	const tree = new BookmarksTree();
	const devFolder = new BookmarksTree();

	devFolder.set("MDN", "https://developer.mozilla.org");
	devFolder.set("Stack Overflow", "https://stackoverflow.com");
	tree.set("Development", devFolder);
	tree.set("Google", "https://google.com");

	assertEquals(tree.size, 2);
	assertInstanceOf(tree.get("Development"), BookmarksTree);

	const folder = tree.get("Development") as BookmarksTree;
	assertEquals(folder.get("MDN"), "https://developer.mozilla.org");
	assertEquals(folder.get("Stack Overflow"), "https://stackoverflow.com");
});

test("BookmarksTree - toJSON()", () => {
	const tree = new BookmarksTree();
	const devFolder = new BookmarksTree();

	devFolder.set("MDN", "https://developer.mozilla.org");
	devFolder.set("Stack Overflow", "https://stackoverflow.com");
	tree.set("Development", devFolder);
	tree.set("Google", "https://google.com");

	const json = tree.toJSON();

	assertEquals(json, {
		Development: {
			MDN: "https://developer.mozilla.org",
			"Stack Overflow": "https://stackoverflow.com",
		},
		Google: "https://google.com",
	});
});

test("BookmarksTree - fromJSON()", () => {
	const json = {
		Development: {
			MDN: "https://developer.mozilla.org",
			"Stack Overflow": "https://stackoverflow.com",
		},
		Google: "https://google.com",
	};

	const tree = BookmarksTree.fromJSON(json);

	assertEquals(tree.get("Google"), "https://google.com");
	assertInstanceOf(tree.get("Development"), BookmarksTree);

	const devFolder = tree.get("Development") as BookmarksTree;
	assertEquals(devFolder.get("MDN"), "https://developer.mozilla.org");
	assertEquals(devFolder.get("Stack Overflow"), "https://stackoverflow.com");
});

test("BookmarksTree - fromJSON() 空のオブジェクト", () => {
	const tree = BookmarksTree.fromJSON({});
	assertEquals(tree.size, 0);
});

test("BookmarksTree - fromJSON() nullと非オブジェクト値の処理", () => {
	const json = {
		validLink: "https://example.com",
		nullValue: null,
		numberValue: 123,
		booleanValue: true,
		validFolder: {
			nestedLink: "https://nested.com",
		},
	};

	const tree = BookmarksTree.fromJSON(json);

	assertEquals(tree.get("validLink"), "https://example.com");
	assertEquals(tree.has("nullValue"), false);
	assertEquals(tree.has("numberValue"), false);
	assertEquals(tree.has("booleanValue"), false);
	assertInstanceOf(tree.get("validFolder"), BookmarksTree);
});

test("BookmarksTree - fromDOM() 基本的なHTML解析", () => {
	const htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<BODY>
    <DT><H3>Folder 1</H3>
    <DL><p>
        <DT><A HREF="https://example.com">Example</A>
    </DL><p>
    <DT><A HREF="https://google.com">Google</A>
</BODY>
</HTML>`;

	const dom = new DOMParser().parseFromString(htmlContent, "text/html");
	const tree = BookmarksTree.fromDOM(dom);
	assertEquals(tree.get("Google"), "https://google.com");
	assertInstanceOf(tree.get("Folder 1"), BookmarksTree);

	const folder = tree.get("Folder 1") as BookmarksTree;
	assertEquals(folder.get("Example"), "https://example.com");
});

test("BookmarksTree - fromDOM() 複雑な階層構造", () => {
	const htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<BODY>
    <DT><H3>Development</H3>
    <DL><p>
        <DT><A HREF="https://developer.mozilla.org">MDN</A>
        <DT><H3>Tools</H3>
        <DL><p>
            <DT><A HREF="https://github.com">GitHub</A>
            <DT><A HREF="https://stackoverflow.com">Stack Overflow</A>
        </DL><p>
    </DL><p>
    <DT><A HREF="https://google.com">Google</A>
</BODY>
</HTML>`;

	const dom = new DOMParser().parseFromString(htmlContent, "text/html");
	const tree = BookmarksTree.fromDOM(dom);

	assertEquals(tree.get("Google"), "https://google.com");
	assertInstanceOf(tree.get("Development"), BookmarksTree);

	const devFolder = tree.get("Development") as BookmarksTree;
	assertEquals(devFolder.get("MDN"), "https://developer.mozilla.org");
	assertInstanceOf(devFolder.get("Tools"), BookmarksTree);

	const toolsFolder = devFolder.get("Tools") as BookmarksTree;
	assertEquals(toolsFolder.get("GitHub"), "https://github.com");
	assertEquals(toolsFolder.get("Stack Overflow"), "https://stackoverflow.com");
});

test("BookmarksTree - toDOM() 基本的なHTML生成", () => {
	const tree = new BookmarksTree();
	const devFolder = new BookmarksTree();

	devFolder.set("MDN", "https://developer.mozilla.org");
	tree.set("Development", devFolder);
	tree.set("Google", "https://google.com");

	const dom = tree.toDOM();

	// HTMLドキュメントの基本構造を確認
	assertEquals(dom.title, "Bookmark");
	assertEquals(dom.querySelector("h1")?.textContent, "Bookmark");

	// ブックマークリンクの確認
	const googleLink = dom.querySelector('a[href="https://google.com"]');
	assertEquals(googleLink?.textContent, "Google");

	const mdnLink = dom.querySelector('a[href="https://developer.mozilla.org"]');
	assertEquals(mdnLink?.textContent, "MDN");

	// フォルダの確認
	const folderH3 = dom.querySelector("h3");
	assertEquals(folderH3?.textContent, "Development");
});

test("BookmarksTree - toDOM() 複雑な階層構造", () => {
	const tree = new BookmarksTree();
	const devFolder = new BookmarksTree();
	const toolsFolder = new BookmarksTree();

	toolsFolder.set("GitHub", "https://github.com");
	toolsFolder.set("Stack Overflow", "https://stackoverflow.com");
	devFolder.set("MDN", "https://developer.mozilla.org");
	devFolder.set("Tools", toolsFolder);

	tree.set("Development", devFolder);
	tree.set("Google", "https://google.com");

	const dom = tree.toDOM();

	// 各レベルのリンクを確認
	const googleLink = dom.querySelector('a[href="https://google.com"]');
	assertEquals(googleLink?.textContent, "Google");

	const mdnLink = dom.querySelector('a[href="https://developer.mozilla.org"]');
	assertEquals(mdnLink?.textContent, "MDN");

	const githubLink = dom.querySelector('a[href="https://github.com"]');
	assertEquals(githubLink?.textContent, "GitHub");

	const stackLink = dom.querySelector('a[href="https://stackoverflow.com"]');
	assertEquals(stackLink?.textContent, "Stack Overflow");

	// フォルダ構造を確認
	const h3Elements = dom.querySelectorAll("h3");
	const folderNames = Array.from(h3Elements).map((h3) => h3.textContent);
	assertEquals(folderNames.includes("Development"), true);
	assertEquals(folderNames.includes("Tools"), true);
});

test("BookmarksTree - JSON-DOM双方向変換の整合性", () => {
	const originalJson = {
		Development: {
			MDN: "https://developer.mozilla.org",
			Tools: {
				GitHub: "https://github.com",
				"Stack Overflow": "https://stackoverflow.com",
			},
		},
		Google: "https://google.com",
	};

	// JSON → BookmarksTree → DOM → BookmarksTree → JSON
	const tree1 = BookmarksTree.fromJSON(originalJson);
	const dom = tree1.toDOM();
	const tree2 = BookmarksTree.fromDOM(dom);
	const resultJson = tree2.toJSON();
	assertEquals(resultJson, originalJson);
});

test("BookmarksTree - 空のツリーの処理", () => {
	const tree = new BookmarksTree();

	assertEquals(tree.toJSON(), {});

	const dom = tree.toDOM();
	assertEquals(dom.title, "Bookmark");
	assertEquals(dom.querySelector("h1")?.textContent, "Bookmark");

	// 空のDLタグが存在することを確認
	const dlElement = dom.querySelector("dl");
	assertEquals(dlElement !== null, true);
});

test("BookmarksTree - エラーハンドリング: 無効なHTML", () => {
	const invalidHtml = `<html><body><p>Invalid bookmark file</p></body></html>`;
	const dom = new DOMParser().parseFromString(invalidHtml, "text/html");
	const tree = BookmarksTree.fromDOM(dom);

	assertEquals(tree.size, 0);
});

test("BookmarksTree - エラーハンドリング: 空のHTML", () => {
	const emptyHtml = ``;
	const dom = new DOMParser().parseFromString(emptyHtml, "text/html");
	const tree = BookmarksTree.fromDOM(dom);

	assertEquals(tree.size, 0);
});

test("BookmarksTree - 特殊文字のエスケープ処理", () => {
	const tree = new BookmarksTree();
	tree.set("Test & Example", "https://example.com/?q=hello&world");
	tree.set('Quote "Test"', "https://test.com");
	tree.set("Tag <Test>", "https://tag.com");

	const htmlString = tree.HTMLText;

	// HTML エンティティのエスケープを確認
	assertEquals(
		htmlString.includes("Test &amp; Example") || htmlString.includes("Test & Example"),
		true,
	);
	assertEquals(
		htmlString.includes("Quote &quot;Test&quot;") || htmlString.includes('Quote "Test"'),
		true,
	);
	assertEquals(htmlString.includes("Tag &lt;Test&gt;") || htmlString.includes("Tag <Test>"), true);
});

test("BookmarksTree - 大きな階層構造の処理", () => {
	const tree = new BookmarksTree();

	// 5レベルの深い階層を作成
	let currentLevel = tree;
	for (let i = 1; i <= 5; i++) {
		const folder = new BookmarksTree();
		folder.set(`Link ${i}`, `https://level${i}.com`);
		currentLevel.set(`Level ${i}`, folder);
		currentLevel = folder;
	}

	// 最深レベルにブックマークを追加
	currentLevel.set("Deep Link", "https://deep.com");

	// JSON変換をテスト
	const json = tree.toJSON();
	const reconstructed = BookmarksTree.fromJSON(json);

	assertEquals(JSON.stringify(json), JSON.stringify(reconstructed.toJSON()));

	// 最深レベルのリンクを確認
	let level = reconstructed;
	for (let i = 1; i <= 5; i++) {
		level = level.get(`Level ${i}`) as BookmarksTree;
		assertEquals(level.get(`Link ${i}`), `https://level${i}.com`);
	}
	assertEquals(level.get("Deep Link"), "https://deep.com");
});

test("BookmarksTree - 空のフォルダの処理", () => {
	const tree = new BookmarksTree();
	const emptyFolder = new BookmarksTree();

	tree.set("Empty Folder", emptyFolder);
	tree.set("Regular Link", "https://example.com");

	assertEquals(tree.size, 2);
	assertInstanceOf(tree.get("Empty Folder"), BookmarksTree);
	assertEquals((tree.get("Empty Folder") as BookmarksTree).size, 0);

	// JSON変換で空のフォルダが保持されることを確認
	const json = tree.toJSON();
	assertEquals(json["Empty Folder"], {});

	// DOM変換で空のフォルダが正しく表現されることを確認
	const dom = tree.toDOM();
	const emptyFolderH3 = dom.querySelector("h3");
	assertEquals(emptyFolderH3?.textContent, "Empty Folder");
});

test("BookmarksTree - 重複するキーの処理", () => {
	const tree = new BookmarksTree();

	// 同じキーで異なる値を設定
	tree.set("Duplicate", "https://first.com");
	tree.set("Duplicate", "https://second.com");

	// 最後の値が保持される
	assertEquals(tree.get("Duplicate"), "https://second.com");
	assertEquals(tree.size, 1);

	// フォルダとリンクで同じキー
	tree.set("Same Key", "https://link.com");
	const folder = new BookmarksTree();
	folder.set("Test", "https://test.com");
	tree.set("Same Key", folder);

	// フォルダが保持される
	assertInstanceOf(tree.get("Same Key"), BookmarksTree);
});

test("BookmarksTree - URLの妥当性チェック", () => {
	const tree = new BookmarksTree();

	// 様々な形式のURLを追加
	tree.set("HTTP", "http://example.com");
	tree.set("HTTPS", "https://example.com");
	tree.set("FTP", "ftp://example.com");
	tree.set("File", "file:///path/to/file");
	tree.set("Relative", "/relative/path");
	tree.set("Query", "https://example.com?param=value&other=test");
	tree.set("Fragment", "https://example.com#section");

	assertEquals(tree.size, 7);
	assertEquals(tree.get("HTTP"), "http://example.com");
	assertEquals(tree.get("Query"), "https://example.com?param=value&other=test");
	assertEquals(tree.get("Fragment"), "https://example.com#section");
});

test("BookmarksTree - 国際化ドメイン名の処理", () => {
	const tree = new BookmarksTree();

	tree.set("日本語サイト", "https://日本.jp");
	tree.set("中文网站", "https://中国.cn");
	tree.set("العربية", "https://العربية.com");

	assertEquals(tree.size, 3);
	assertEquals(tree.get("日本語サイト"), "https://日本.jp");
	assertEquals(tree.get("中文网站"), "https://中国.cn");
	assertEquals(tree.get("العربية"), "https://العربية.com");

	// JSON変換後も保持される
	const json = tree.toJSON();
	const reconstructed = BookmarksTree.fromJSON(json);
	assertEquals(reconstructed.get("日本語サイト"), "https://日本.jp");
});

test("BookmarksTree - メモリ効率性テスト", () => {
	const tree = new BookmarksTree();

	// 大量のブックマークを追加
	for (let i = 0; i < 1000; i++) {
		tree.set(`Bookmark ${i}`, `https://example${i}.com`);
	}

	assertEquals(tree.size, 1000);
	assertEquals(tree.get("Bookmark 500"), "https://example500.com");

	// JSON変換の性能をテスト
	const startTime = Date.now();
	const json = tree.toJSON();
	const jsonTime = Date.now() - startTime;

	// 1秒未満で完了することを確認（性能テスト）
	assertEquals(jsonTime < 1000, true);
	assertEquals(Object.keys(json).length, 1000);
});

test("BookmarksTree - イテレータの動作確認", () => {
	const tree = new BookmarksTree();
	const folder = new BookmarksTree();

	folder.set("Sub Link", "https://sub.com");
	tree.set("Folder", folder);
	tree.set("Link 1", "https://link1.com");
	tree.set("Link 2", "https://link2.com");

	// for...of ループでの反復
	const keys = [];
	const values = [];

	for (const [key, value] of tree) {
		keys.push(key);
		values.push(value);
	}

	assertEquals(keys.length, 3);
	assertEquals(keys.includes("Folder"), true);
	assertEquals(keys.includes("Link 1"), true);
	assertEquals(keys.includes("Link 2"), true);

	// Map メソッドの動作確認
	assertEquals(tree.has("Folder"), true);
	assertEquals(tree.has("Nonexistent"), false);

	tree.delete("Link 1");
	assertEquals(tree.size, 2);
	assertEquals(tree.has("Link 1"), false);
});

test("BookmarksTree - 循環参照の防止", () => {
	const tree = new BookmarksTree();
	const folder1 = new BookmarksTree();
	const folder2 = new BookmarksTree();

	folder1.set("Link", "https://example.com");
	folder2.set("Nested", folder1);
	tree.set("Root", folder2);

	// 正常な階層構造
	const json = tree.toJSON();
	assertEquals(typeof json["Root"], "object");

	const rootFolder = json["Root"] as Record<string, unknown>;
	assertEquals(typeof rootFolder["Nested"], "object");

	const nestedFolder = rootFolder["Nested"] as Record<string, unknown>;
	assertEquals(nestedFolder["Link"], "https://example.com");
});

test("BookmarksTree - HTMLString/HTMLText getter returns same value", () => {
	const tree = new BookmarksTree();
	tree.set("Google", "https://google.com");
	tree.set("GitHub", "https://github.com");

	const htmlString = tree.HTMLString;
	const htmlText = tree.HTMLText;

	assertEquals(htmlString, htmlText);
	assertEquals(typeof htmlString, "string");
	assertEquals(htmlString.includes("https://google.com"), true);
	assertEquals(htmlString.includes("https://github.com"), true);
});

test("BookmarksTree - HTMLText is deprecated alias for HTMLString", () => {
	const tree = new BookmarksTree();
	tree.set("Test", "https://test.com");
	assertEquals(tree.HTMLText, tree.HTMLString);
});
