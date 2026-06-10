import * as libEvents from "@libs/events";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { ThemeSignals } from "./api.ts";

export default plugins.create((api: plugins.API) => {
  const signals = new libEvents.SignalEmitter<ThemeSignals>();

  return {
    theme: {
      signals: signals.listener,

      set(name: keyof typeof themes.Themes): void {
        signals.broadcast("change", name);
      },
    },

    init(): void {
      api.runtime.events.on("start")(async () => api.theme.set("Mauve"));
    },
  };
});
