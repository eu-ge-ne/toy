import { Key } from "@lib/input";

import { App } from "../app.ts";

export abstract class Action {
  constructor(protected app: App) {
  }

  async run(): Promise<void> {
    const started = Date.now();

    try {
      this.app.actions_started += 1;

      await this._run();
    } finally {
      this.app.actions_started -= 1;

      this.app.ui.debug.set_action_time(Date.now() - started);
    }
  }

  abstract match(key: Key | string): boolean;

  protected abstract _run(): Promise<void>;
}
