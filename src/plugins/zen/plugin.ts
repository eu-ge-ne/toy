import * as api from "@libs/api";
import * as libEvents from "@libs/events";
import * as plugins from "@libs/plugins";

const signals = new libEvents.SignalEmitter<api.ZenSignals>();

let enabled = true;

export default {
  register: {
    zen(): api.Zen {
      return {
        signals: signals.listener,
        get enabled(): boolean {
          return enabled;
        },
        toggle(): void {
          enabled = !enabled;

          signals.broadcast("toggle");
        },
      };
    },
  },
} satisfies plugins.Plugin;
