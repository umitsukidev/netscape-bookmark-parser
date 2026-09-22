import type { JSDOM } from "jsdom";

type JSDOMWindow = InstanceType<typeof JSDOM>["window"];
export type Element = JSDOMWindow["Element"]["prototype"];
export type HTMLDocument = JSDOMWindow["document"];
