import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";

const clients = new events.Clients<
  api.RuntimeInterceptorEvents,
  api.RuntimeReactorEvents
>();

const emitter = new events.Emitter<
  api.RuntimeInterceptorEvents,
  api.RuntimeReactorEvents
>(clients);

const listener = new events.Listener<
  api.RuntimeInterceptorEvents,
  api.RuntimeReactorEvents
>(clients);

export default {
  initRuntime(api: api.API): api.RuntimeAPI {
    return {
      events: listener,
      async start(): Promise<void> {
        globalThis.addEventListener(
          "unhandledrejection",
          (e) => api.runtime.stop(e),
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
