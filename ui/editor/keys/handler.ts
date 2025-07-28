import { Key } from "@lib/input";

import { Editor } from "../editor.ts";

export abstract class KeyHandler {
  abstract keys: Pick<Key, "name" | "super" | "shift" | "ctrl">[];

  constructor(protected editor: Editor) {
  }

  match(key: Key | string): boolean {
    return typeof key !== "string" &&
      this.keys.some((x) =>
        x.name === key.name && x.super === key.super && x.shift === key.shift &&
        x.ctrl === key.ctrl
      );
  }

  abstract handle(key: Key | string): boolean;
}
