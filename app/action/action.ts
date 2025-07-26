import { Key } from "@lib/input";

import { App } from "../app.ts";

type KeyMatcher = Pick<Key, "name" | "super" | "shift" | "ctrl">;

export abstract class Action {
  abstract keys: KeyMatcher[];

  constructor(protected app: App) {
  }

  async run(key?: Key | string): Promise<void> {
    const started = Date.now();

    await this._run(key);

    this.app.ui.debug.set_action_time(Date.now() - started);
  }

  match(key: Key | string): boolean {
    if (typeof key === "string") {
      return false;
    }

    return this.keys.some((x) =>
      x.name === key.name && x.super === key.super && x.shift === key.shift &&
      x.ctrl === key.ctrl
    );
  }

  protected abstract _run(key?: Key | string): Promise<void>;
}
