import * as kitty from "@libs/kitty";

import { Editor } from "../editor.ts";
import { InputHandler } from "./handler.ts";

export const cursorHandlers: (new (_: Editor) => InputHandler)[] = [
  class CursorLeft extends InputHandler {
    match(key: kitty.Key): boolean {
      return key.name === "LEFT";
    }

    handle(key: kitty.Key) {
      this.editor.cursor.left(Boolean(key.shift));
    }
  },

  class CursorRight extends InputHandler {
    match(key: kitty.Key): boolean {
      return key.name === "RIGHT";
    }

    handle(key: kitty.Key) {
      this.editor.cursor.right(Boolean(key.shift));
    }
  },

  class CursorHome extends InputHandler {
    match(key: kitty.Key): boolean {
      if (key.name === "HOME") {
        return true;
      }

      if (key.name === "LEFT" && key.super) {
        return true;
      }

      return false;
    }

    handle(key: kitty.Key) {
      this.editor.cursor.home(Boolean(key.shift));
    }
  },

  class CursorEnd extends InputHandler {
    match(key: kitty.Key): boolean {
      if (key.name === "END") {
        return true;
      }

      if (key.name === "RIGHT" && key.super) {
        return true;
      }

      return false;
    }

    handle(key: kitty.Key) {
      this.editor.cursor.end(Boolean(key.shift));
    }
  },

  class SelectAll extends InputHandler {
    match(key: kitty.Key): boolean {
      return key.name === "a" && Boolean(key.ctrl || key.super);
    }

    handle(_: kitty.Key) {
      this.editor.cursor.selectAll();
    }
  },
];
