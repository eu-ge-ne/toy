import { InterceptorData } from "@libs/events";

export type InterceptorEvents = {
  "start": (_: InterceptorData) => Promise<void>;
  "stop": (
    _: InterceptorData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
  "stop.after": (
    _: InterceptorData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
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
