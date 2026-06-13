import * as libEvents from "@libs/events";
import * as themes from "@libs/themes";
import * as plugins from "@plugins/plugins";

declare module "@plugins/plugins" {
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
