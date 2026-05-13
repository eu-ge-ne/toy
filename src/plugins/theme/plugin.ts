import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

export default class ThemePlugin extends plugins.Plugin {
  #evs = events.create<
    api.ThemeInterceptorEvents,
    api.ThemeReactorEvents
  >();

  override initTheme(): api.ThemeAPI {
    return {
      events: this.#evs.listener,
      set: (name: keyof typeof themes.Themes) => {
        this.#evs.emitter.broadcast("change", name);
      },
    };
  }
}
