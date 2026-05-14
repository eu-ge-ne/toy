import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";

const { emitter, listener } = events.create<
  api.RuntimeInterceptorEvents,
  api.RuntimeReactorEvents
>();

export default {
  initRuntime(host: api.Host): api.Runtime {
    return {
      events: listener,
      async start(): Promise<void> {
        globalThis.addEventListener(
          "unhandledrejection",
          (e) => host.runtime.stop(e),
        );

        await emitter.dispatch("start", {});
      },
      async stop(e?: PromiseRejectionEvent): Promise<void> {
        await emitter.dispatch("stop", { e });

        if (e) {
          console.log(e.reason);
        }

        Deno.exit(0);
      },
    };
  },
} satisfies plugins.Plugin;
