import { Key } from "@lib/input";

import { App } from "../app.ts";

export abstract class Command {
  abstract keys: Pick<Key, "name" | "super" | "shift" | "ctrl">[];

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

    Command.started += 1;

    await this.command(key);

    Command.started -= 1;

    this.app.ui.debug.set_command_time(Date.now() - started);
  }

  protected abstract command(key?: Key | string): Promise<void>;
}
