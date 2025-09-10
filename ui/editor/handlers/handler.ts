import { Key } from "@lib/vt";

import { Editor } from "../editor.ts";

export abstract class EditorHandler {
  abstract keys: Key[];

  constructor(protected editor: Editor) {
  }

  match(key: Record<string, unknown>): boolean {
    return this.keys.some((x) =>
      Object.entries(x).every(([k, v]) => k === "code" || key[k] === v)
    );
  }

  abstract handle(key: Key): boolean;
}
