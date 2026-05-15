import * as api from "@libs/api";
import * as libEvents from "@libs/events";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

const signals = new libEvents.SignalEmitter<api.ThemeSignals>();

export default {
  initTheme(): api.Theme {
    return {
      signals: signals.listener,
      set(name: keyof typeof themes.Themes): void {
        signals.broadcast("change", name);
      },
    };
  },
} satisfies plugins.Plugin;
