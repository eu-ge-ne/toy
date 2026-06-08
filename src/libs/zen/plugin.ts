import * as api from "@libs/api";
import * as libEvents from "@libs/events";
import * as plugins from "@libs/plugins";

import { ZenAPI, ZenSignals } from "./api.ts";

let signals: libEvents.SignalEmitter<ZenSignals>;
let enabled = true;

export const plugin = {
  register: {
    zen(toy: api.Toy): ZenAPI {
      signals = new libEvents.SignalEmitter<ZenSignals>();

      return {
        signals: signals.listener,

        get enabled(): boolean {
          return enabled;
        },

        toggle(): void {
          enabled = !enabled;

          signals.broadcast("toggle");

          toy.io.resize();
        },
      };
    },
  },
} satisfies plugins.Plugin;
