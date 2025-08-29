import { KittyKey } from "@lib/vt";

import { App } from "../app.ts";

export abstract class Command {
  abstract match_keys: Pick<KittyKey, "name" | "super" | "shift" | "ctrl">[];

  abstract option?: {
    id: string;
    description: string;
    shortcuts?: string;
  };

  static running = 0;

  constructor(protected app: App) {
  }

  match(key: KittyKey): boolean {
    return this.match_keys.some((x) =>
      x.name === key.name && x.super === key.super && x.shift === key.shift &&
      x.ctrl === key.ctrl
    );
  }

  async run(key?: KittyKey | string): Promise<void> {
    Command.running += 1;

    await this.command(key);

    Command.running -= 1;
  }

  protected abstract command(key?: KittyKey | string): Promise<void>;
}
