import { InterceptorData } from "@libs/events";
import * as kitty from "@libs/kitty";

export type InterceptorEvents = {
  "start": (_: InterceptorData) => Promise<void>;
  "stop": (
    _: InterceptorData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
  "stop.after": (
    _: InterceptorData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
  "key.press": (_: InterceptorData<{ key: kitty.Key }>) => Promise<void>;
};

export type ReactorEvents = {
  "resize": () => void;
  "render.before": () => void;
  "render": () => void;
  "render.after": () => void;
  "debug.version": (_: string) => void;
  "debug.render": (_: number) => void;
  "debug.input": (_: number) => void;
  "status.doc.name": (_: string) => void;
  "status.doc.modified": (_: { modified: boolean; lineCount: number }) => void;
  "status.doc.cursor": (_: { ln: number; col: number }) => void;
};
