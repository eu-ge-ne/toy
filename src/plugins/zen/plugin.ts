import * as libEvents from "@libs/events";
import * as plugins from "@libs/plugins";

export function plugin(api: plugins.API): plugins.Plugin {
  const signals = new libEvents.SignalEmitter<plugins.ZenSignals>();
  let enabled = true;

  return {
    zen: {
      signals: signals.listener,

      get enabled(): boolean {
        return enabled;
      },

      toggle(): void {
        enabled = !enabled;

        signals.broadcast("toggle");

        api.io.resize();
      },
    },
  };
}
