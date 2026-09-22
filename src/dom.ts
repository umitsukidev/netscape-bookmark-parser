/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

type DOMParserType = typeof globalThis.DOMParser;

export let DOMParser: DOMParserType = globalThis.DOMParser;

export const setDOMParser = (parser: DOMParserType): void => {
	DOMParser = parser;
};
