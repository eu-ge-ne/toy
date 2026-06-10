import * as libEvents from "@libs/events";
import * as plugins from "@libs/plugins";

import { ZenSignals } from "./api.ts";

export default plugins.create((api: plugins.API) => {
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
});
