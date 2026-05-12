import * as events from "@libs/events";

export type InterceptorEvents = {
  "stop": (
    _: events.InterceptorData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
};

export type ReactorEvents = Record<PropertyKey, never>;
