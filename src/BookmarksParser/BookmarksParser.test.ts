/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, test } from "vitest";
import { BookmarksParser } from "./BookmarksParser.ts";
import { BookmarksTree } from "../BookmarksTree/index.ts";
import { DOMParser } from "../deps.ts";

const assertEquals = (actual: unknown, expected: unknown) =>
	expect(actual).toEqual(expected);
const assertInstanceOf = (
	actual: unknown,
	expected: abstract new (...args: any[]) => any,
) => expect(actual).toBeInstanceOf(expected);
const assertThrows = (fn: () => unknown) => expect(fn).toThrow();

test("Parser - 基本的なHTMLパース", () => {
	const htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<BODY>
<DL><p>
    <DT><A HREF="https://google.com">Google</A>
    <DT><A HREF="https://github.com">GitHub</A>
</DL><p>
</BODY>
</HTML>`;

	const tree = BookmarksParser.parse(htmlContent);

	assertInstanceOf(tree, BookmarksTree);
	assertEquals(tree.get("Google"), "https://google.com");
	assertEquals(tree.get("GitHub"), "https://github.com");
	assertEquals(tree.size, 2);
});

test("Parser - フォルダ構造を含むHTMLパース", () => {
	const htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<BODY>
<DL><p>
    <DT><H3>Development</H3>
    <DL><p>
        <DT><A HREF="https://developer.mozilla.org">MDN</A>
        <DT><A HREF="https://stackoverflow.com">Stack Overflow</A>
    </DL><p>
    <DT><A HREF="https://google.com">Google</A>
</DL><p>
</BODY>
</HTML>`;

	const tree = BookmarksParser.parse(htmlContent);

	assertEquals(tree.get("Google"), "https://google.com");
	assertInstanceOf(tree.get("Development"), BookmarksTree);

	const devFolder = tree.get("Development") as BookmarksTree;
	assertEquals(devFolder.get("MDN"), "https://developer.mozilla.org");
	assertEquals(devFolder.get("Stack Overflow"), "https://stackoverflow.com");
});

test("Parser - 複雑な階層構造のHTMLパース", () => {
	const htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<BODY>
<DL><p>
    <DT><H3>Work</H3>
    <DL><p>
        <DT><H3>Development</H3>
        <DL><p>
            <DT><A HREF="https://github.com">GitHub</A>
            <DT><A HREF="https://stackoverflow.com">Stack Overflow</A>
        </DL><p>
        <DT><A HREF="https://docs.google.com">Google Docs</A>
    </DL><p>
    <DT><H3>Personal</H3>
    <DL><p>
        <DT><A HREF="https://youtube.com">YouTube</A>
        <DT><A HREF="https://twitter.com">Twitter</A>
    </DL><p>
    <DT><A HREF="https://google.com">Google</A>
</DL><p>
</BODY>
</HTML>`;

	const tree = BookmarksParser.parse(htmlContent);

	assertEquals(tree.get("Google"), "https://google.com");
	assertEquals(tree.size, 3);

	// Workフォルダの確認
	assertInstanceOf(tree.get("Work"), BookmarksTree);
	const workFolder = tree.get("Work") as BookmarksTree;
	assertEquals(workFolder.get("Google Docs"), "https://docs.google.com");

	// Development サブフォルダの確認
	assertInstanceOf(workFolder.get("Development"), BookmarksTree);
	const devFolder = workFolder.get("Development") as BookmarksTree;
	assertEquals(devFolder.get("GitHub"), "https://github.com");
	assertEquals(devFolder.get("Stack Overflow"), "https://stackoverflow.com");

	// Personalフォルダの確認
	assertInstanceOf(tree.get("Personal"), BookmarksTree);
	const personalFolder = tree.get("Personal") as BookmarksTree;
	assertEquals(personalFolder.get("YouTube"), "https://youtube.com");
	assertEquals(personalFolder.get("Twitter"), "https://twitter.com");
});

test("Parser - Chromeエクスポート形式のHTMLパース", () => {
	const htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!--This is an automatically generated file.
It will be read and overwritten.
Do Not Edit! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1640995200" LAST_MODIFIED="1640995200">ブックマーク バー</H3>
    <DL><p>
        <DT><A HREF="https://google.com" ADD_DATE="1640995200">Google</A>
        <DT><A HREF="https://github.com" ADD_DATE="1640995200">GitHub</A>
    </DL><p>
    <DT><H3 ADD_DATE="1640995200" LAST_MODIFIED="1640995200">その他のブックマーク</H3>
    <DL><p>
        <DT><A HREF="https://youtube.com" ADD_DATE="1640995200">YouTube</A>
    </DL><p>
</DL><p>`;

	const tree = BookmarksParser.parse(htmlContent);

	assertInstanceOf(tree.get("ブックマーク バー"), BookmarksTree);
	assertInstanceOf(tree.get("その他のブックマーク"), BookmarksTree);

	const bookmarkBar = tree.get("ブックマーク バー") as BookmarksTree;
	assertEquals(bookmarkBar.get("Google"), "https://google.com");
	assertEquals(bookmarkBar.get("GitHub"), "https://github.com");

	const otherBookmarks = tree.get("その他のブックマーク") as BookmarksTree;
	assertEquals(otherBookmarks.get("YouTube"), "https://youtube.com");
});

test("Parser - 空のHTMLパース", () => {
	const htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<BODY>
<DL><p>
</DL><p>
</BODY>
</HTML>`;

	const tree = BookmarksParser.parse(htmlContent);

	assertInstanceOf(tree, BookmarksTree);
	assertEquals(tree.size, 0);
});

test("Parser - 無効なHTMLの処理", () => {
	const htmlContent = `<html><body><p>This is not a bookmark file</p></body></html>`;

	const tree = BookmarksParser.parse(htmlContent);

	assertInstanceOf(tree, BookmarksTree);
	assertEquals(tree.size, 0);
});

test("Parser - 特殊文字を含むHTMLパース", () => {
	const htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<BODY>
<DL><p>
    <DT><A HREF="https://example.com/?q=hello%20world&amp;lang=ja">検索 &amp; テスト</A>
    <DT><H3>フォルダ &lt;テスト&gt;</H3>
    <DL><p>
        <DT><A HREF="https://example.com/test">テスト "サイト"</A>
    </DL><p>
</DL><p>
</BODY>
</HTML>`;

	const tree = BookmarksParser.parse(htmlContent);

	assertEquals(
		tree.get("検索 & テスト"),
		"https://example.com/?q=hello%20world&lang=ja"
	);
	assertInstanceOf(tree.get("フォルダ <テスト>"), BookmarksTree);

	const testFolder = tree.get("フォルダ <テスト>") as BookmarksTree;
	assertEquals(testFolder.get('テスト "サイト"'), "https://example.com/test");
});

test("Parser - 空文字列の処理", () => {
	const tree = BookmarksParser.parse("");

	assertInstanceOf(tree, BookmarksTree);
	assertEquals(tree.size, 0);
});

test("Parser - HREF属性のないリンクの処理", () => {
	const htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<BODY>
<DL><p>
    <DT><A>無効なリンク</A>
    <DT><A HREF="">空のリンク</A>
    <DT><A HREF="https://valid.com">有効なリンク</A>
</DL><p>
</BODY>
</HTML>`;

	const tree = BookmarksParser.parse(htmlContent);

	// 有効なリンクのみが追加される
	assertEquals(tree.size, 1);
	assertEquals(tree.get("有効なリンク"), "https://valid.com");
	assertEquals(tree.has("無効なリンク"), false);
	assertEquals(tree.has("空のリンク"), false);
});

test("Parser.parseFromHTMLString works like parse", () => {
	const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<HTML>\n<BODY>\n<DL><p>\n    <DT><A HREF=\"https://google.com\">Google</A>\n</DL><p>\n</BODY>\n</HTML>`;
	const tree1 = BookmarksParser.parse(html);
	const tree2 = BookmarksParser.parseFromHTMLString(html);
	assertEquals(tree1.toJSON(), tree2.toJSON());
});

test("Parser.parseFromDOM works", () => {
	const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<HTML>\n<BODY>\n<DL><p>\n    <DT><A HREF=\"https://google.com\">Google</A>\n</DL><p>\n</BODY>\n</HTML>`;
	const dom = new DOMParser().parseFromString(html, "text/html");
	const tree = BookmarksParser.parseFromDOM(dom);
	assertInstanceOf(tree, BookmarksTree);
	assertEquals(tree.get("Google"), "https://google.com");
});

test("Parser.parseFromJSONString and parseFromJSON", () => {
	const json =
		'{"Google":"https://google.com","Dev":{"GitHub":"https://github.com"}}';
	const obj = {
		Google: "https://google.com",
		Dev: { GitHub: "https://github.com" },
	};
	const treeFromJSONString = BookmarksParser.parseFromJSONString(json);
	const treeFromJSON = BookmarksParser.parseFromJSON(obj);
	assertInstanceOf(treeFromJSONString, BookmarksTree);
	assertInstanceOf(treeFromJSON, BookmarksTree);
	assertEquals(treeFromJSONString.toJSON(), treeFromJSON.toJSON());
	assertEquals(treeFromJSONString.get("Google"), "https://google.com");
	assertEquals(
		(treeFromJSONString.get("Dev") as BookmarksTree).get("GitHub"),
		"https://github.com"
	);
});

test("Parser.parseFromJSONString with invalid JSON throws", () => {
	const invalid = '{"Google": }';
	assertThrows(() => {
		BookmarksParser.parseFromJSONString(invalid);
	});
});

test("Parser.parseFromJSON with empty object", () => {
	const tree = BookmarksParser.parseFromJSON({});
	assertInstanceOf(tree, BookmarksTree);
	assertEquals(tree.size, 0);
});
