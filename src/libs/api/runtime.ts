import * as events from "@libs/events";

export type RuntimeInterceptorEvents = {
  start: (_: events.DispatchData) => Promise<void>;
  stop: (
    _: events.DispatchData<{ e?: PromiseRejectionEvent }>,
  ) => Promise<void>;
};

export type RuntimeReactorEvents = Record<PropertyKey, never>;

export type Runtime = {
  events: events.Listener<RuntimeInterceptorEvents, RuntimeReactorEvents>;
  start(): Promise<void>;
  stop(e?: PromiseRejectionEvent): Promise<void>;
};
