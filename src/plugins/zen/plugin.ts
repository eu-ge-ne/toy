import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";

const emitter = new events.Emitter<api.ZenEvents, api.ZenReactorEvents>();

let enabled = true;

export default {
  initZen(): api.Zen {
    return {
      events: emitter.events,
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
