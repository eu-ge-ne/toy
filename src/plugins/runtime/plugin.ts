import * as libEvents from "@libs/events";

export type API = {
  runtime: {
    events: libEvents.Listener<RuntimeEvents>;
    start(): Promise<void>;
    stop(e?: PromiseRejectionEvent): Promise<void>;
  };
};

type RuntimeEvents = {
  start: (_: libEvents.EventData) => Promise<void>;
  stop: (_: libEvents.EventData<{ e?: PromiseRejectionEvent }>) => Promise<void>;
};

export function plugin(): API {
  const events = new libEvents.EventEmitter<RuntimeEvents>();

  async function start(): Promise<void> {
    globalThis.addEventListener("unhandledrejection", (e) => stop(e));

    await events.dispatch("start", {});
  }

  async function stop(e?: PromiseRejectionEvent): Promise<void> {
    await events.dispatch("stop", { e });

    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  }

  return {
    runtime: {
      events: events.listener,
      start,
      stop,
    },
  };
}
