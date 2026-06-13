import * as events from "@libs/events";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

export function plugin(api: plugins.API): plugins.Plugin {
  const signals = new events.SignalEmitter<plugins.ThemeSignals>();

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
