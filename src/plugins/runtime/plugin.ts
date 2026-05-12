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
  runtimeApi(): api.RuntimeApi {
    return {
      events: listener,
      async stop(e?: PromiseRejectionEvent): Promise<void> {
        await emitter.intercept("stop", { e });
      },
    };
  },
} satisfies plugins.Plugin;
