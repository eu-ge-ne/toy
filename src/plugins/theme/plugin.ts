import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

const emitter = new events.SignalEmitter<api.ThemeSignals>();

export default {
  initTheme(): api.Theme {
    return {
      signals: emitter.signals,
      set(name: keyof typeof themes.Themes): void {
        emitter.broadcast("change", name);
      },
    };
  },
} satisfies plugins.Plugin;
