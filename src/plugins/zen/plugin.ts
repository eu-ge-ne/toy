import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";

export default class ZenPlugin extends plugins.Plugin {
  #evs = events.create<
    api.ZenInterceptorEvents,
    api.ZenReactorEvents
  >();

  #enabled = true;

  override initZen(): api.ZenAPI {
    return {
      events: this.#evs.listener,
      enabled: () => {
        return this.#enabled;
      },
      toggle: () => {
        this.#enabled = !this.#enabled;

        this.#evs.emitter.broadcast("toggle");
      },
    };
  }
}
