import * as kitty from "@libs/kitty";

import { Editor } from "../editor.ts";
import { InputHandler } from "./handler.ts";

export const singleLineHandlers: (new (_: Editor) => InputHandler)[] = [
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

  class Text extends InputHandler {
    match(key: kitty.Key): boolean {
      return typeof key.text === "string";
    }

    handle(key: kitty.Key) {
      const { cursor: { pos, from, to, isSelecting }, buffer } = this.editor;

      if (isSelecting) {
        buffer.replace(from, to, key.text!);
      } else {
        buffer.insert(pos, key.text!);
      }
    }
  },

  class Tab extends InputHandler {
    match(key: kitty.Key): boolean {
      return key.name === "TAB";
    }

    handle(_: kitty.Key) {
      const { cursor, buffer } = this.editor;

      if (cursor.isSelecting) {
        buffer.replace(cursor.from, cursor.to, "\t");
      } else {
        buffer.insert(cursor.pos, "\t");
      }
    }
  },

  class Delete extends InputHandler {
    match(key: kitty.Key): boolean {
      return key.name === "DELETE";
    }

    handle(_: kitty.Key) {
      const { from, to } = this.editor.cursor;
      this.editor.buffer.remove(from, to);
    }
  },

  class Backspace extends InputHandler {
    match(key: kitty.Key): boolean {
      return key.name === "BACKSPACE";
    }

    handle(_: kitty.Key) {
      const { cursor: { pos, from, to, isSelecting }, buffer } = this.editor;

      if (isSelecting) {
        buffer.remove(from, to);
      } else {
        if (pos.col > 0) {
          const p = { ln: pos.ln, col: pos.col - 1 };
          buffer.remove(p, p);
        } else if (pos.ln > 0) {
          const ln = pos.ln - 1;
          const prevLine = buffer.cells(ln);
          const col = [...prevLine].length - 1;
          const p = { ln, col };
          buffer.remove(p, p);
        }
      }
    }
  },

  class Copy extends InputHandler {
    match(key: kitty.Key): boolean {
      return key.name === "c" && Boolean(key.ctrl || key.super);
    }

    handle(_: kitty.Key) {
      this.editor.copy();
    }
  },

  class Cut extends InputHandler {
    match(key: kitty.Key): boolean {
      return key.name === "x" && Boolean(key.ctrl || key.super);
    }

    handle(_: kitty.Key) {
      this.editor.cut();
    }
  },

  class Paste extends InputHandler {
    match(key: kitty.Key): boolean {
      return key.name === "v" && Boolean(key.ctrl || key.super);
    }

    handle(_: kitty.Key) {
      this.editor.paste();
    }
  },

  class Undo extends InputHandler {
    match(key: kitty.Key): boolean {
      return key.name === "z" && Boolean(key.ctrl || key.super);
    }

    handle(_: kitty.Key) {
      this.editor.buffer.undoHistory();
    }
  },

  class Redo extends InputHandler {
    match(key: kitty.Key): boolean {
      return key.name === "y" && Boolean(key.ctrl || key.super);
    }

    handle(_: kitty.Key) {
      this.editor.buffer.redoHistory();
    }
  },
];
