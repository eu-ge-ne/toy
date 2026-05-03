import { InterceptorEventData, ReactorEventData } from "@libs/events";

export type SyncInterceptorEvents = Record<PropertyKey, never>;

export type AsyncInterceptorEvents = {
  "start": (_: InterceptorEventData) => Promise<void>;
  "stop": (
    _: InterceptorEventData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
  "stop.after": (
    _: InterceptorEventData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
};

export type ReactorEvents = {
  "resize": (_: ReactorEventData) => void;
  "render.before": (_: ReactorEventData) => void;
  "render": (_: ReactorEventData) => void;
  "render.after": (_: ReactorEventData) => void;
  "debug.version": (_: ReactorEventData<string>) => void;
  "debug.render": (_: ReactorEventData<number>) => void;
  "debug.input": (_: ReactorEventData<number>) => void;
  "status.doc.name": (_: ReactorEventData<string>) => void;
  "status.doc.modified": (
    _: ReactorEventData<{ modified: boolean; lineCount: number }>,
  ) => void;
  "status.doc.cursor": (
    _: ReactorEventData<{ ln: number; col: number }>,
  ) => void;
};
