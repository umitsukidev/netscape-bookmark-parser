/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { DOMParser as NodeDOMParser } from "@b-fuze/deno-dom";
import { setDOMParser } from "./dom.ts";

setDOMParser(NodeDOMParser);
