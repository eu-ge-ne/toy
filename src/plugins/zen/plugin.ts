import * as api from "@libs/api";
import * as plugins from "@libs/plugins";

export default class ZenPlugin extends plugins.Plugin {
  #enabled = true;

  override initZen(): api.ZenAPI {
    const plugin = this;

    return new class extends api.ZenAPI {
      enabled(): boolean {
        return plugin.#enabled;
      }

      toggle(): void {
        plugin.#enabled = !plugin.#enabled;

        this.emitter.broadcast("toggle");
      }
    }();
  }
}
