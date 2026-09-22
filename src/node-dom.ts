/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { JSDOM } from "jsdom";
import { setDOMParser } from "./dom.ts";

const jsdom = new JSDOM("");
const NodeDOMParserClass = jsdom.window.DOMParser;

setDOMParser(NodeDOMParserClass as unknown as typeof globalThis.DOMParser);
