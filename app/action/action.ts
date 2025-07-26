import { Key } from "@lib/input";

import { App } from "../app.ts";

type KeyMatcher = Pick<Key, "name" | "super" | "shift" | "ctrl">;

export abstract class Action {
  abstract keys: KeyMatcher[];

  protected static started = 0;

  constructor(protected app: App) {
  }

  match(key: Key | string): boolean {
    return typeof key !== "string" &&
      this.keys.some((x) =>
        x.name === key.name && x.super === key.super && x.shift === key.shift &&
        x.ctrl === key.ctrl
      );
  }

  async run(key?: Key | string): Promise<void> {
    const started = Date.now();

    Action.started += 1;

    await this._run(key);

    Action.started -= 1;

    this.app.ui.debug.set_action_time(Date.now() - started);
  }

  protected abstract _run(key?: Key | string): Promise<void>;
}
