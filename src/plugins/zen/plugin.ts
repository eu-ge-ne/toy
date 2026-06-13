import * as libEvents from "@libs/events";

import * as io from "@plugins/io";

export type API = {
  zen: {
    signals: libEvents.Listener<ZenSignals>;
    get enabled(): boolean;
    toggle(): void;
  };
};

type ZenSignals = {
  "toggle": () => void;
};

export function plugin(api: io.API): API {
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
