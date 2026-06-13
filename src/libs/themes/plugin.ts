import * as libEvents from "@libs/events";
import "@libs/plugins";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

declare module "@libs/plugins" {
  export interface API {
    theme: {
      signals: libEvents.Listener<ThemeSignals>;
      set(_: keyof typeof themes.Themes): void;
    };
  }
}

type ThemeSignals = {
  "change": (_: keyof typeof themes.Themes) => void;
};

export function plugin(api: plugins.API): plugins.Result {
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
}
