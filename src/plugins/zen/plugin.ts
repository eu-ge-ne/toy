import * as events from "@libs/events";

import * as core from "@plugins/core";

export type API = {
  zen: Zen;
};

export function Plugin(api: core.API): API {
  return {
    zen: new Zen(api),
  };
}

class Zen {
  readonly #emitter = new events.SignalEmitter<{
    "toggle": () => void;
  }>();

  #enabled = false;

  constructor(private readonly api: core.API) {
  }

  readonly signals = this.#emitter.listener;

  get enabled(): boolean {
    return this.#enabled;
  }

  toggle(): void {
    this.#enabled = !this.#enabled;

    this.#emitter.broadcast("toggle");

    this.api.core.resize();
  }
}
