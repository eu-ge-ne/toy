import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";

const { emitter, listener } = events.create<
  api.ZenInterceptorEvents,
  api.ZenReactorEvents
>();

let enabled = true;

export default {
  initZen(): api.ZenAPI {
    return {
      events: listener,
      get enabled(): boolean {
        return enabled;
      },
      toggle(): void {
        enabled = !enabled;

        emitter.broadcast("toggle");
      },
    };
  },
} satisfies plugins.Plugin;
