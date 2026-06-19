import * as kitty from "@libs/kitty";

import { InputHandler } from "./handler.ts";

export class SelectAll extends InputHandler {
  match(key: kitty.Key): boolean {
    return key.name === "a" && Boolean(key.ctrl || key.super);
  }

  handle(_: kitty.Key) {
    this.editor.cursor.selectAll();
  }
}

export class CursorLeft extends InputHandler {
  match(key: kitty.Key): boolean {
    return key.name === "LEFT";
  }

  handle(key: kitty.Key) {
    this.editor.cursor.left(Boolean(key.shift));
  }
}

export class CursorRight extends InputHandler {
  match(key: kitty.Key): boolean {
    return key.name === "RIGHT";
  }

  handle(key: kitty.Key) {
    this.editor.cursor.right(Boolean(key.shift));
  }
}

export class CursorHome extends InputHandler {
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
}

export class CursorEnd extends InputHandler {
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
}

export class Tab extends InputHandler {
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
}

export class Delete extends InputHandler {
  match(key: kitty.Key): boolean {
    return key.name === "DELETE";
  }

  handle(_: kitty.Key) {
    const { from, to } = this.editor.cursor;
    this.editor.buffer.remove(from, to);
  }
}
