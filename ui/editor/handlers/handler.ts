import { Key } from "@lib/key";

import { Editor } from "../editor.ts";

export abstract class EditorHandler {
  constructor(protected editor: Editor) {
  }

  abstract match(key: Key): boolean;

  abstract handle(key: Key): boolean;
}
