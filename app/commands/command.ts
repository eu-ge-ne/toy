import { Key } from "@lib/key";
import { PaletteOption } from "@ui/palette";

import { App } from "../app.ts";

export abstract class Command {
  abstract keys: Key[];

  abstract option?: PaletteOption;

  constructor(protected app: App) {
  }

  abstract match(key: Key): boolean;

  abstract run(): Promise<void>;
}
