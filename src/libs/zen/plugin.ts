import * as libEvents from "@libs/events";
import * as plugins from "@libs/plugins";

declare module "@libs/plugins" {
  export interface API {
    zen: {
      signals: libEvents.Listener<ZenSignals>;
      get enabled(): boolean;
      toggle(): void;
    };
  }
}

type ZenSignals = {
  "toggle": () => void;
};

export function plugin(api: plugins.API): plugins.Result {
  const signals = new libEvents.SignalEmitter<ZenSignals>();
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
