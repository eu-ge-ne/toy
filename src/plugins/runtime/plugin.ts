import * as events from "@libs/events";

export type RuntimeAPI = ReturnType<typeof RuntimePlugin>;

export function RuntimePlugin() {
  return {
    runtime: new Runtime(),
  };
}

class Runtime {
  private readonly emitter = new events.EventEmitter<{
    start: (_: events.EventData) => Promise<void>;
    stop: (_: events.EventData<{ e?: PromiseRejectionEvent }>) => Promise<void>;
  }>();

  readonly events = this.emitter.listener;

  async start(): Promise<void> {
    globalThis.addEventListener("unhandledrejection", (e) => this.stop(e));

    await this.emitter.dispatch("start", {});
  }

  async stop(e?: PromiseRejectionEvent): Promise<void> {
    await this.emitter.dispatch("stop", { e });

    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  }
}
