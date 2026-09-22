/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type {
	DOMParser as NodeDOMParser,
	Element,
	HTMLDocument,
} from "@b-fuze/deno-dom";

export type { Element, HTMLDocument };

// The Node entry point installs deno-dom before consumers call parser methods;
// the browser entry point uses the native DOMParser already present globally.
export let DOMParser: typeof NodeDOMParser = globalThis.DOMParser as unknown as typeof NodeDOMParser;

export const setDOMParser = (parser: typeof NodeDOMParser): void => {
	DOMParser = parser;
};
