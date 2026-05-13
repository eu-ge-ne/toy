import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";

export default class RuntimePlugin extends plugins.Plugin {
  #evs = events.create<
    api.RuntimeInterceptorEvents,
    api.RuntimeReactorEvents
  >();

  override initRuntime(api: api.Host): api.RuntimeAPI {
    return {
      events: this.#evs.listener,
      start: async () => {
        globalThis.addEventListener(
          "unhandledrejection",
          (e) => api.runtime.stop(e),
        );

        await this.#evs.emitter.dispatch("start", {});
      },
      stop: async (e?: PromiseRejectionEvent) => {
        await this.#evs.emitter.dispatch("stop", { e });

        if (e) {
          console.log(e.reason);
        }

        Deno.exit(0);
      },
    };
  }
}
