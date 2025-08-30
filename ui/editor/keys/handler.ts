import { Key } from "@lib/vt";

import { Editor } from "../editor.ts";

export abstract class KeyHandler {
  abstract keys: Pick<Partial<Key>, "name" | "super" | "shift" | "ctrl">[];

  constructor(protected editor: Editor) {
  }

  match(key: Partial<Key> | string): boolean {
    return typeof key !== "string" &&
      this.keys.some((x) =>
        Object.entries(x).every(([k, v]) =>
          (key as unknown as Record<string, unknown>)[k] === v
        )
      );
  }

  abstract handle(key: Partial<Key> | string): boolean;
}
