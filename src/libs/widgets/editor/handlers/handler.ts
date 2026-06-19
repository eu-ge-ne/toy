import * as kitty from "@libs/kitty";
import { Editor } from "../editor.ts";

export abstract class InputHandler {
  constructor(protected readonly editor: Editor) {
  }

  abstract match(_: kitty.Key): boolean;

  abstract handle(_: kitty.Key): void;
}
