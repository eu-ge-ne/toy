import { Key } from "@lib/vt";

import { App } from "../app.ts";

export abstract class Command {
  abstract match_keys: (
    & Pick<Key, "name">
    & Pick<
      Partial<Key>,
      "super" | "shift" | "ctrl"
    >
  )[];

  abstract option?: {
    id: string;
    description: string;
    shortcuts?: string;
  };

  static running = 0;

  constructor(protected app: App) {
  }

  match(key: Key): boolean {
    return this.match_keys.some((x) =>
      Object.entries(x).every(([k, v]) =>
        (key as unknown as Record<string, unknown>)[k] === v
      )
    );
  }

  async run(key?: Key | string): Promise<void> {
    Command.running += 1;

    await this.command(key);

    Command.running -= 1;
  }

  protected abstract command(key?: Key | string): Promise<void>;
}
