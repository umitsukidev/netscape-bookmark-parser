# Netscape Bookmark Parser

A TypeScript/JavaScript library for parsing browser bookmark files (HTML format) and manipulating them as structured data. Compatible with both Deno and Node.js runtimes.

> **Note:**  
> This README is an AI-generated document. Details are mostly accurate but might include inaccurate description.

日本語ドキュメント: [`./README-ja.md`](./README-ja.md)

## Features

- **HTML Bookmark File Parsing**: Parse exported HTML bookmark files from Chrome, Firefox, Safari, and other browsers
- **Hierarchical Structure Preservation**: Completely preserve the hierarchical structure of folders and bookmarks
- **Bidirectional Conversion**: Support conversion from HTML to data structure and vice versa
- **JSON Serialization**: Save and restore bookmark trees as JSON
- **Deno & Node.js Support**: Works with both Deno and Node.js runtimes
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Installation

### Node.js/npm

```bash
npm install netscape-bookmark-parser
```

```typescript
import { BookmarksParser, BookmarksTree } from "netscape-bookmark-parser";
```

### Deno

```typescript
import {
	BookmarksParser,
	BookmarksTree,
} from "jsr:@grakeice/netscape-bookmark-parser";
```

> **Note:** The JSR package provides the Node.js/Deno entry. For browser support, use the npm package's dependency-free `./web` entry.

### Browser

#### Option 1: Using Build Tools (Recommended)

**Webpack, Vite, Rollup, Parcel, etc.:**

```typescript
// For browser environments, use the web-optimized version
import { BookmarksParser, BookmarksTree } from "netscape-bookmark-parser/web";

// Example: Parse uploaded bookmark file
function handleFileUpload(event: Event) {
	const file = (event.target as HTMLInputElement).files?.[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const htmlContent = e.target?.result as string;
			const bookmarksTree = BookmarksParser.parse(htmlContent);
			console.log(bookmarksTree.toJSON());
		};
		reader.readAsText(file);
	}
}
```

#### Option 2: CDN with Import Maps

```html
<script type="importmap">
	{
		"imports": {
			"netscape-bookmark-parser/web": "https://cdn.jsdelivr.net/npm/netscape-bookmark-parser@1.1.4/dist/web.js"
		}
	}
</script>
<script type="module">
	import { BookmarksParser, BookmarksTree } from "netscape-bookmark-parser/web";
	const tree = BookmarksParser.parse(htmlContent);
</script>
```

#### Option 3: Direct CDN Import

```html
<script type="module">
	import {
		BookmarksParser,
		BookmarksTree,
	} from "https://cdn.jsdelivr.net/npm/netscape-bookmark-parser@1.1.4/dist/web.js";
</script>
```

> **Browser Support:** The web-optimized version is available from the npm `./web` export. It uses native browser APIs and has no DOM library dependency.

> **Note:** The web-optimized version uses native browser APIs (DOMParser, etc.) and does not include Node.js polyfills, making it lighter and faster in browser environments.

## Usage

### Basic Example

```typescript
import { BookmarksParser, BookmarksTree } from "netscape-bookmark-parser";

// Read HTML bookmark file
const htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<BODY>
<DL><p>
    <DT><H3>Folder 1</H3>
    <DL><p>
        <DT><A HREF="https://example.com">Example</A>
    </DL><p>
    <DT><A HREF="https://google.com">Google</A>
</DL><p>
</BODY>
</HTML>`;

// Parse HTML and convert to BookmarksTree
const bookmarksTree = BookmarksParser.parse(htmlContent);

// Output as JSON
console.log(JSON.stringify(bookmarksTree.toJSON(), null, 2));

// Convert back to HTML
const htmlDocument = bookmarksTree.toDOM();
console.log(bookmarksTree.HTMLText);
```

### BookmarksTree Operations

```typescript
// Create a new bookmark tree
const tree = new BookmarksTree();

// Add bookmarks
tree.set("Google", "https://google.com");
tree.set("GitHub", "https://github.com");

// Create a folder structure
const devFolder = new BookmarksTree();
devFolder.set("MDN", "https://developer.mozilla.org");
devFolder.set("Stack Overflow", "https://stackoverflow.com");

const toolsFolder = new BookmarksTree();
toolsFolder.set("GitHub", "https://github.com");
toolsFolder.set("VS Code", "https://code.visualstudio.com");

devFolder.set("Tools", toolsFolder);
tree.set("Development", devFolder);

// Convert to JSON
const json = tree.toJSON();

// Restore from JSON
const restoredTree = BookmarksTree.fromJSON(json);

// Check tree structure
console.log(tree.size); // Number of top-level items
console.log(tree.has("Development")); // true
console.log(tree.get("Development") instanceof BookmarksTree); // true
```

### Working with Complex Structures

```typescript
// Parse a complex bookmark file
const complexHtml = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
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

const tree = BookmarksParser.parse(complexHtml);

// Navigate the tree structure
const workFolder = tree.get("Work") as BookmarksTree;
const devFolder = workFolder.get("Development") as BookmarksTree;
console.log(devFolder.get("GitHub")); // "https://github.com"
```

## API Reference

### Web-Optimized Version

> **Important:** Browser support is available from the npm `./web` export.

The library provides a browser-optimized version that eliminates Node.js dependencies and uses native browser APIs:

```typescript
// Import the browser-optimized version
import { BookmarksParser, BookmarksTree } from "netscape-bookmark-parser/web";
```

> **Note:** The web-optimized version uses native browser APIs (DOMParser, etc.) and does not include Node.js polyfills, making it lighter and faster in browser environments.

### BookmarksParser Class

`BookmarksParser` provides static methods to parse Netscape Bookmark format HTML or JSON and convert them into `BookmarksTree` instances.

#### Static Methods

- [`static parse(htmlString: string): BookmarksTree`](#static-parsehtmlstring-string-bookmarkstree)

  - Parses a Netscape Bookmark format HTML string and returns a `BookmarksTree`.
  - Alias for [`parseFromHTMLString`](#static-parsefromhtmlstringhtmlstring-string-bookmarkstree).

  **Example:**

  ```typescript
  const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<HTML><BODY><DL><p>\n  <DT><A HREF=\"https://example.com\">Example</A>\n</DL><p></BODY></HTML>`;
  const tree = BookmarksParser.parse(html);
  console.log(tree.toJSON());
  ```

- [`static parseFromHTMLString(htmlString: string): BookmarksTree`](#static-parsefromhtmlstringhtmlstring-string-bookmarkstree)

  - Parses a Netscape Bookmark format HTML string and returns a `BookmarksTree`.

  **Example:**

  ```typescript
  const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>...`;
  const tree = BookmarksParser.parseFromHTMLString(html);
  ```

- [`static parseFromDOM(dom: HTMLDocument): BookmarksTree`](#static-parsefromdomdom-htmldocument-bookmarkstree)

  - Converts an existing `HTMLDocument` to a `BookmarksTree`.

  **Example:**

  ```typescript
  const dom = new DOMParser().parseFromString(html, "text/html");
  const tree = BookmarksParser.parseFromDOM(dom);
  ```

- [`static parseFromJSON(jsonString: string): BookmarksTree`](#static-parsefromjsonjsonstring-string-bookmarkstree)

  - Parses a JSON string and returns a `BookmarksTree`.

  **Example:**

  ```typescript
  const json = '{"Google": "https://google.com"}';
  const tree = BookmarksParser.parseFromJSON(json);
  ```

---

### BookmarksTree Class

`BookmarksTree` extends `Map` and manages folders (`BookmarksTree`) and bookmarks (URL strings) in a hierarchical structure.

#### Constructor

- [`new BookmarksTree()`](#constructor)

  **Example:**

  ```typescript
  const tree = new BookmarksTree();
  tree.set("Google", "https://google.com");
  ```

#### Instance Methods

- [`toJSON(): Record<string, unknown>`](#tojson-recordstring-unknown)

  - Converts the tree to a JSON object representation.

  **Example:**

  ```typescript
  const json = tree.toJSON();
  console.log(json);
  ```

- [`toDOM(): HTMLDocument`](#todom-htmldocument)

  - Converts the tree to a Netscape Bookmark format HTML document.

  **Example:**

  ```typescript
  const dom = tree.toDOM();
  ```

- [`get HTMLString(): string`](#get-htmlstring-string)

  - Gets the complete HTML string in Netscape Bookmark format.

  **Example:**

  ```typescript
  const html = tree.HTMLString;
  console.log(html);
  ```

- [`get HTMLText(): string`](#get-htmltext-string)
  - Alias for `HTMLString` (deprecated).

#### Static Methods

- [`static fromJSON(json: Record<string, unknown>): BookmarksTree`](#static-fromjsonjson-recordstring-unknown-bookmarkstree)

  - Creates a tree from a JSON object.

  **Example:**

  ```typescript
  const json = { Google: "https://google.com" };
  const tree = BookmarksTree.fromJSON(json);
  ```

- [`static fromDOM(dom: HTMLDocument): BookmarksTree`](#static-fromdomdom-htmldocument-bookmarkstree)

  - Creates a tree from an HTML document.

  **Example:**

  ```typescript
  const dom = new DOMParser().parseFromString(html, "text/html");
  const tree = BookmarksTree.fromDOM(dom);
  ```

## Project Structure

```
src/
├── BookmarksTree/
│   ├── BookmarksTree.ts      # Main bookmark tree class
│   ├── BookmarksTree.test.ts # Comprehensive tests
│   └── index.ts             # Export definitions
└── BookmarksParser/
    ├── BookmarksParser.ts    # HTML parser
    ├── BookmarksParser.test.ts # Parser tests
    └── index.ts             # Export definitions
scripts/
└── sync-jsr-version.mjs     # Keep JSR version in sync with package.json
.github/
└── workflows/
    ├── changesets.yml        # Changesets version pull requests
    ├── ci.yml                # Test, typecheck, and build checks
    └── release.yml           # NPM/JSR publishing and GitHub releases
dist/                        # Generated package files (not committed)
```

## Development and Release

Install dependencies with pnpm and run the local checks:

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
```

Create a release note with `pnpm changeset`. Changesets opens a version pull request on `main`; merging it updates `package.json` and synchronizes the JSR version in `jsr.json`. A subsequent `main` push publishes the package to NPM and JSR and creates the matching `v<version>` Git tag and GitHub release.

## Supported Formats

### Input Formats

- **Netscape Bookmark File Format**: Standard HTML bookmark file format
- **Chrome Export Format**: HTML files exported from Chrome browser
- **Firefox Export Format**: HTML files exported from Firefox browser
- **Safari Export Format**: HTML files exported from Safari browser
- **Edge Export Format**: HTML files exported from Microsoft Edge
- **Generic HTML**: Any HTML following the Netscape bookmark structure

### Output Formats

- **JSON**: Structured JSON data for easy programmatic access
- **HTML**: Standard Netscape Bookmark File Format compatible with all browsers
- **DOM**: Browser-compatible HTMLDocument objects

### Special Features

- **Unicode Support**: Full support for international characters and emojis
- **URL Validation**: Handles various URL formats (http, https, ftp, file, relative)
- **HTML Entity Handling**: Proper escaping and unescaping of HTML entities
- **Empty Folder Support**: Preserves empty folders in the bookmark structure
- **Duplicate Handling**: Last value wins for duplicate bookmark names

## Dependencies

- [`jsdom`](https://github.com/jsdom/jsdom): DOM parser and manipulation for Node.js environments

## Browser Compatibility

### Supported Browsers for Export Files

- **Chrome/Chromium**: All versions
- **Firefox**: All versions
- **Safari**: All versions
- **Microsoft Edge**: All versions
- **Opera**: All versions
- **Internet Explorer**: 6+ (legacy support)

### Exported File Examples

The library can parse bookmark files exported from:

```html
<!-- Chrome/Edge format -->
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!--This is an automatically generated file.-->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1640995200">Bookmarks bar</H3>
    <DL><p>
        <DT><A HREF="https://example.com" ADD_DATE="1640995200">Example</A>
    </DL><p>
</DL>

<!-- Firefox format -->
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks Menu</H1>
<DL><p>
    <DT><H3>Bookmarks Toolbar</H3>
    <DL><p>
        <DT><A HREF="https://example.com">Example Site</A>
    </DL><p>
</DL>
```

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Author

**grakeice**

- GitHub: [@grakeice](https://github.com/grakeice)

## Changelog

### v1.1.4 (Latest)

- 🛠️ **Improved parser** (better compatibility with various bookmark HTML formats, increased stability)
- 🧹 **Code refactoring and additional tests**
- 🐞 **Minor bug fixes**
- 📚 **Documentation Update**: API Reference refresh, unified explanations, added usage examples, revived various sections

### v1.1.3

- 📝 **Added JSDoc comments**: Added JSDoc-style comments to major classes and methods to improve type information and enable automatic API documentation generation
- 📚 **Documentation Update**: Added TypeScript import example for Node.js/npm in the Installation section

### v1.1.2

- 📝 **Documentation Enhancement**: Updated comprehensive README documentation with latest version references and improved examples
- 🔧 **Version Consistency**: Synchronized version numbers across all documentation and code examples
- 📚 **Content Updates**: Refined installation instructions, usage examples, and API documentation for better clarity

### v1.1.1

- 🛡️ **Security Enhancement**: [`BookmarksTree.prototype.HTMLText`](src/BookmarksTree/BookmarksTree.ts) now properly escapes HTML entities in bookmark titles and URLs
- 🔧 **Code Consistency**: Unified HTML escaping behavior between Node.js and browser versions
- 📝 **Documentation Updates**: Enhanced API documentation with security considerations
- 🐛 **Bug Fixes**: Minor stability improvements and edge case handling

### v1.1.0

- 🌐 **Browser Support**: Added web-optimized version for browser environments
- 📦 **Dual Entry Points**: Separate builds for Node.js/Deno (`src/index.ts`) and browsers (`src/web.ts`)
- ⚡ **Native DOM APIs**: Browser version uses native DOMParser and DOM APIs for better performance
- 🔧 **Build Optimization**: Enhanced build process with polyfill removal for browser compatibility
- 📚 **Updated Documentation**: Added browser usage examples and API reference

### v1.0.1

- ✨ **Core Features**: Complete HTML bookmark file parsing functionality
- 🏗️ **BookmarksTree Class**: Hierarchical structure management with Map interface
- 🔄 **Bidirectional Conversion**: JSON ↔ HTML ↔ DOM conversion support
- 🧪 **Comprehensive Testing**: Full test coverage with edge case handling
- 📦 **Multi-Runtime Support**: Native Deno and Node.js compatibility
- 🔧 **TypeScript Support**: Complete type definitions and IntelliSense
- 🤖 **CI/CD Pipeline**: Automated testing and publishing via GitHub Actions
- 📚 **Documentation**: Comprehensive README with examples and API reference
- 🌐 **International Support**: Unicode and multi-language bookmark handling
- ⚡ **Performance Optimized**: Efficient parsing for large bookmark collections
- 🛡️ **Error Handling**: Graceful handling of malformed HTML and invalid URLs

### v0.0.1-pre4

- Early pre-release version
- Core functionality proof of concept
- Basic parsing implementation
- Initial testing setup
