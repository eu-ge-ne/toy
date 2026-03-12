import { Key } from "@lib/kitty";

import { Editor } from "../main.ts";

export abstract class EditorHandler {
  constructor(protected editor: Editor) {
  }

  abstract match(key: Key): boolean;

  abstract handle(key: Key): boolean;
}
