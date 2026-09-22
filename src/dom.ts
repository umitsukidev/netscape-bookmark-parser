/**
 * Copyright (c) 2025-2026 kurage(@umitsukidev)
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type { DOMParser as NodeDOMParser } from "@b-fuze/deno-dom";

export let DOMParser: typeof NodeDOMParser =
	globalThis.DOMParser as unknown as typeof NodeDOMParser;

export const setDOMParser = (parser: typeof NodeDOMParser): void => {
	DOMParser = parser;
};
