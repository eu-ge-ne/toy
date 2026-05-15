import * as api from "@libs/api";
import * as libEvents from "@libs/events";
import * as plugins from "@libs/plugins";

const events = new libEvents.EventEmitter<api.RuntimeEvents>();

export default {
  initRuntime(host: api.Host): api.Runtime {
    return {
      events: events.listener,
      async start(): Promise<void> {
        globalThis.addEventListener("unhandledrejection", (e) => host.runtime.stop(e));

        await events.dispatch("start", {});
      },
      async stop(e?: PromiseRejectionEvent): Promise<void> {
        await events.dispatch("stop", { e });

        if (e) {
          console.log(e.reason);
        }

        Deno.exit(0);
      },
    };
  },
} satisfies plugins.Plugin;
