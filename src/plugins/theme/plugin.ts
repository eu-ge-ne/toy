import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

const emitter = new events.Emitter<
  api.ThemeInterceptorEvents,
  api.ThemeReactorEvents
>();

export default {
  initTheme(): api.Theme {
    return {
      events: emitter.events,
      set(name: keyof typeof themes.Themes): void {
        emitter.broadcast("change", name);
      },
    };
  },
} satisfies plugins.Plugin;
