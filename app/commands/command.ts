import { Key } from "@lib/vt";

import { App } from "../app.ts";

export abstract class Command {
  abstract keys: Key[];

  abstract option?: {
    id: string;
    description: string;
    shortcuts?: string;
  };

  static running = 0;

  constructor(protected app: App) {
  }

  match(key: Record<string, unknown>): boolean {
    return this.keys.some((x) =>
      Object.entries(x).every(([k, v]) => k === "code" || key[k] === v)
    );
  }

  async run(key?: Key): Promise<void> {
    Command.running += 1;

    await this.command(key);

    Command.running -= 1;
  }

  protected abstract command(key?: Key): Promise<void>;
}
