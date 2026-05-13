import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

const { emitter, listener } = events.create<
  api.ThemeInterceptorEvents,
  api.ThemeReactorEvents
>();

export default {
  initTheme(): api.ThemeAPI {
    return {
      events: listener,
      set(name: keyof typeof themes.Themes): void {
        emitter.broadcast("change", name);
      },
    };
  },
} satisfies plugins.Plugin;
