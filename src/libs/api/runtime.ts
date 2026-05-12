import * as events from "@libs/events";

export type RuntimeInterceptorEvents = {
  "stop": (
    _: events.InterceptorData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
};

export type RuntimeReactorEvents = Record<PropertyKey, never>;

export type RuntimeApi = {
  events: events.Listener<RuntimeInterceptorEvents, RuntimeReactorEvents>;
  stop(e?: PromiseRejectionEvent): Promise<void>;
};
