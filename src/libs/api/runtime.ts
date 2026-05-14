import * as events from "@libs/events";

export type RuntimeEvents = {
  start: (_: events.EventData) => Promise<void>;
  stop: (_: events.EventData<{ e?: PromiseRejectionEvent }>) => Promise<void>;
};

export type Runtime = {
  events: events.Listener<RuntimeEvents>;
  start(): Promise<void>;
  stop(e?: PromiseRejectionEvent): Promise<void>;
};
