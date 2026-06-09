import * as libEvents from "@libs/events";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { ThemeAPI, ThemeSignals } from "./api.ts";

let signals: libEvents.SignalEmitter<ThemeSignals>;

export const plugin = {
  register: {
    theme(): ThemeAPI {
      signals = new libEvents.SignalEmitter<ThemeSignals>();

      return {
        signals: signals.listener,
        set(name: keyof typeof themes.Themes): void {
          signals.broadcast("change", name);
        },
      };
    },
  },

  init(api: plugins.API): void {
    api.runtime.events.on("start")(async () => api.theme.set("Mauve"));
  },
} satisfies plugins.Plugin;
