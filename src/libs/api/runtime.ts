import * as events from "@libs/events";

export type RuntimeInterceptorEvents = {
  start: (_: events.InterceptorData) => Promise<void>;
  stop: (
    _: events.InterceptorData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
};

export type RuntimeReactorEvents = Record<PropertyKey, never>;

export type RuntimeApi = {
  events: events.Listener<RuntimeInterceptorEvents, RuntimeReactorEvents>;
  start(): Promise<void>;
  stop(e?: PromiseRejectionEvent): Promise<void>;
};
