import * as events from "@libs/events";

export type RuntimeEvents = {
  start: (_: events.EventData) => Promise<void>;
  stop: (_: events.EventData<{ e?: PromiseRejectionEvent }>) => Promise<void>;
};

export type RuntimeReactorEvents = Record<PropertyKey, never>;

export type Runtime = {
  events: events.Listener<RuntimeEvents, RuntimeReactorEvents>;
  start(): Promise<void>;
  stop(e?: PromiseRejectionEvent): Promise<void>;
};
