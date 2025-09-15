import { Key } from "@lib/vt";

import { App } from "../app.ts";

export abstract class Command {
  abstract keys: Key[];

  abstract option?: {
    id: string;
    description: string;
    shortcuts?: string;
  };

  constructor(protected app: App) {
  }

  match(key: Record<string, unknown>): boolean {
    return this.keys.some((x) =>
      Object.entries(x).every(([k, v]) => k === "code" || key[k] === v)
    );
  }

  abstract run(key?: Key): Promise<void>;
}
