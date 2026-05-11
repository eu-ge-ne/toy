import * as events from "@libs/events";

export type InterceptorEvents = {
  "start": (_: events.InterceptorData) => Promise<void>;
  "stop": (
    _: events.InterceptorData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
};

export type ReactorEvents = Record<PropertyKey, never>;
