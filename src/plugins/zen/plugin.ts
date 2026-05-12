import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";

const clients = new events.Clients<
  api.ZenInterceptorEvents,
  api.ZenReactorEvents
>();

const emitter = new events.Emitter<
  api.ZenInterceptorEvents,
  api.ZenReactorEvents
>(clients);

const listener = new events.Listener<
  api.ZenInterceptorEvents,
  api.ZenReactorEvents
>(clients);

let enabled = true;

export default {
  initZen(): api.ZenApi {
    return {
      events: listener,
      get enabled(): boolean {
        return enabled;
      },
      toggle(): void {
        enabled = !enabled;
        emitter.react("toggle");
      },
    };
  },
} satisfies plugins.Plugin;
