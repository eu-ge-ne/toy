import { Key } from "@lib/vt";

import { Editor } from "../editor.ts";

export abstract class EditorHandler {
  abstract keys: Key[];

  constructor(protected editor: Editor) {
  }

  match(key: Key): boolean {
    return this.keys.some((x) =>
      Object.entries(x).every(([k, v]) =>
        (key as unknown as Record<string, unknown>)[k] === v
      )
    );
  }

  abstract handle(key: Key): boolean;
}
