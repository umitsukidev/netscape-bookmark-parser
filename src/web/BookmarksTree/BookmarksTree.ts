/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { DOMParser, type Element, type HTMLDocument } from "../deps.ts";

/**
 * A class representing a bookmark tree in Netscape Bookmark format
 *
 * This class extends Map and manages folders (BookmarksTree) and bookmarks (URL strings)
 * in a hierarchical structure.
 *
 * @example
 * ```typescript
 * const tree = new BookmarksTree();
 * tree.set("Google", "https://google.com");
 *
 * const folder = new BookmarksTree();
 * folder.set("GitHub", "https://github.com");
 * tree.set("Development", folder);
 * ```
 */
export class BookmarksTree extends Map<string, string | BookmarksTree> {
	/**
	 * Creates a new BookmarksTree instance
	 */
	constructor() {
		super();
	}

	/**
	 * Converts the BookmarksTree to a JSON object
	 *
	 * Folders are recursively converted to objects, and bookmarks are preserved as strings.
	 *
	 * @returns JSON object representation of the bookmark data
	 *
	 * @example
	 * ```typescript
	 * const tree = new BookmarksTree();
	 * tree.set("Google", "https://google.com");
	 * const json = tree.toJSON();
	 * // { "Google": "https://google.com" }
	 * ```
	 */
	toJSON(): Record<string, unknown> {
		const json: Record<string, unknown> = {};

		for (const [key, value] of this.entries()) {
			if (typeof value === "string") {
				json[key] = value;
			} else if (value instanceof BookmarksTree) {
				json[key] = value.toJSON();
			}
		}

		return json;
	}

	/**
	 * Creates a BookmarksTree from a JSON object
	 *
	 * String properties are treated as bookmarks, and object properties are
	 * recursively processed as folders.
	 *
	 * @param json The source JSON object to convert
	 * @returns A new BookmarksTree instance
	 *
	 * @example
	 * ```typescript
	 * const json = { "Google": "https://google.com", "Development": { "GitHub": "https://github.com" } };
	 * const tree = BookmarksTree.fromJSON(json);
	 * ```
	 */
	static fromJSON(json: Record<string, unknown>): BookmarksTree {
		const tree = new BookmarksTree();

		if (typeof json === "object" && json !== null) {
			for (const [key, value] of Object.entries(json)) {
				if (typeof value === "string") {
					tree.set(key, value);
				} else if (typeof value === "object" && value !== null) {
					tree.set(
						key,
						BookmarksTree.fromJSON(value as Record<string, unknown>)
					);
				}
			}
		}

		return tree;
	}

	/**
	 * Creates a BookmarksTree from an HTML document (Netscape Bookmark format)
	 *
	 * Parses Netscape Bookmark format HTML and generates a BookmarksTree that preserves
	 * the hierarchical structure. H3 elements within DT elements are treated as folders,
	 * and A elements are treated as bookmarks.
	 *
	 * @param dom The HTML document to parse
	 * @returns A new BookmarksTree instance
	 *
	 * @example
	 * ```typescript
	 * const parser = new DOMParser();
	 * const dom = parser.parseFromString(bookmarkHtml, "text/html");
	 * const tree = BookmarksTree.fromDOM(dom);
	 * ```
	 */
	static fromDOM(dom: HTMLDocument): BookmarksTree {
		const tree = new BookmarksTree();
		const document = dom;

		const processElement = (element: Element, currentTree: BookmarksTree) => {
			const children = Array.from(element.children) as Element[];

			for (let i = 0; i < children.length; i++) {
				const child = children[i];

				if (child.tagName === "DT") {
					const h3 = child.querySelector("h3");
					const link = child.querySelector("a");

					if (h3) {
						// フォルダの場合
						const folderName = h3.textContent?.trim() || "";
						if (folderName) {
							const folderTree = new BookmarksTree();
							currentTree.set(folderName, folderTree);
							processElement(child, folderTree);
						}
					} else if (link) {
						// リンクの場合
						const href = link.getAttribute("href");
						const title = link.textContent?.trim() || "";
						if (href && title) {
							currentTree.set(title, href);
						}
					}
				} else if (child.tagName === "DL") {
					// ネストしたDLタグの場合も処理
					processElement(child, currentTree);
				}
			}
		};

		// HTMLのBODY全体から処理を開始
		const body = document.body;
		if (body) {
			processElement(body, tree);
		}

		return tree;
	}

	/**
	 * Converts the BookmarksTree to an HTML document
	 *
	 * Generates an HTML document in Netscape Bookmark format.
	 *
	 * @returns HTML document in Netscape Bookmark format
	 *
	 * @example
	 * ```typescript
	 * const tree = new BookmarksTree();
	 * tree.set("Google", "https://google.com");
	 * const dom = tree.toDOM();
	 * ```
	 */
	toDOM(): HTMLDocument {
		return new DOMParser().parseFromString(this.HTMLString, "text/html");
	}

	/**
	 * Gets the BookmarksTree as an HTML string in Netscape Bookmark format
	 *
	 * Generates a complete HTML document string including DOCTYPE, metadata, and body
	 * in Netscape Bookmark format.
	 *
	 * @returns HTML string in Netscape Bookmark format
	 *
	 * @example
	 * ```typescript
	 * const tree = new BookmarksTree();
	 * tree.set("Google", "https://google.com");
	 * const html = tree.HTMLString;
	 * console.log(html); // <!DOCTYPE NETSCAPE-Bookmark-file-1>...
	 * ```
	 */
	get HTMLString(): string {
		const escapeHtml = (text: string): string => {
			return text
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#39;");
		};

		const createBookmarkList = (
			tree: BookmarksTree,
			indent: string = ""
		): string => {
			let html = `${indent}<DL><p>\n`;

			for (const [key, value] of tree.entries()) {
				if (typeof value === "string") {
					// ブックマークの場合: <DT><A HREF="url">タイトル</A>
					html += `${indent}    <DT><A HREF="${escapeHtml(value)}">${escapeHtml(
						key
					)}</A>\n`;
				} else if (value instanceof BookmarksTree) {
					// フォルダの場合: <DT><H3>フォルダ名</H3>
					html += `${indent}    <DT><H3>${escapeHtml(key)}</H3>\n`;
					html += createBookmarkList(value, indent + "    ");
					html += `${indent}    </DL><p>\n`;
				}
			}

			if (indent === "") {
				// ルートレベルの場合は閉じタグを追加
				html += `</DL>\n`;
			}

			return html;
		};

		const htmlTemplate = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmark</TITLE>
<H1>Bookmark</H1>
<BODY>
${createBookmarkList(this)}</BODY>
</HTML>`;
		return htmlTemplate;
	}

	/**
	 * @deprecated Use {@link HTMLString} instead.
	 *
	 * Gets the BookmarksTree as an HTML string in Netscape Bookmark format.
	 */
	get HTMLText(): string {
		return this.HTMLString;
	}
}
