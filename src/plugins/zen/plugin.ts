import * as events from "@libs/events";

import { CoreAPI } from "@plugins/core";

export type ZenAPI = ReturnType<typeof ZenPlugin>;

export function ZenPlugin(...api: ConstructorParameters<typeof Zen>) {
  return {
    zen: new Zen(...api),
  };
}

class Zen {
  private readonly emitter = new events.SignalEmitter<{
    "toggle": () => void;
  }>();

  #enabled = true;

  constructor(private readonly api: CoreAPI) {
  }

  readonly signals = this.emitter.listener;

  get enabled(): boolean {
    return this.#enabled;
  }

  toggle(): void {
    this.#enabled = !this.#enabled;

    this.emitter.broadcast("toggle");

    this.api.core.resize();
  }
}
