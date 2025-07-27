import { Key } from "@lib/input";

import { App } from "../app.ts";

export abstract class Command {
  option?: { name: string; description: string };

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

  async run(key?: Key | string): Promise<Command | undefined> {
    const started = Date.now();

    Command.started += 1;

    const result = await this.command(key);

    Command.started -= 1;

    this.app.ui.debug.set_command_time(Date.now() - started);

    return result;
  }

  protected abstract command(key?: Key | string): Promise<Command | undefined>;
}
