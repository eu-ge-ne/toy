import { Key } from "@lib/input";

import { Editor } from "../editor.ts";

type KeyMatcher = Pick<Key, "name" | "super" | "shift" | "ctrl">;

export abstract class KeyHandler {
  abstract keys: KeyMatcher[];

  constructor(protected editor: Editor) {
  }

  abstract handle(key: Key): void;

  match(key: Key): boolean {
    return this.keys.some((x) =>
      x.name === key.name && x.super === key.super && x.shift === key.shift &&
      x.ctrl === key.ctrl
    );
  }
}
