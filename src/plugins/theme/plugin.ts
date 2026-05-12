import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

const clients = new events.Clients<
  api.ThemeInterceptorEvents,
  api.ThemeReactorEvents
>();

const emitter = new events.Emitter<
  api.ThemeInterceptorEvents,
  api.ThemeReactorEvents
>(clients);

const listener = new events.Listener<
  api.ThemeInterceptorEvents,
  api.ThemeReactorEvents
>(clients);

export default {
  initTheme(): api.ThemeApi {
    return {
      events: listener,
      set(name: keyof typeof themes.Themes): void {
        emitter.react("change", name);
      },
    };
  },
} satisfies plugins.Plugin;
