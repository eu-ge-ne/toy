import * as kitty from "@libs/kitty";

import { InputHandler } from "./handler.ts";

export class CursorUp extends InputHandler {
  match(key: kitty.Key): boolean {
    return key.name === "UP";
  }

  handle(key: kitty.Key) {
    this.editor.cursor.up(1, Boolean(key.shift));
  }
}

export class CursorDown extends InputHandler {
  match(key: kitty.Key): boolean {
    return key.name === "DOWN";
  }

  handle(key: kitty.Key) {
    this.editor.cursor.down(1, Boolean(key.shift));
  }
}

export class CursorTop extends InputHandler {
  match(key: kitty.Key): boolean {
    return key.name === "UP" && Boolean(key.super);
  }

  handle(key: kitty.Key) {
    this.editor.cursor.top(Boolean(key.shift));
  }
}

export class CursorBottom extends InputHandler {
  match(key: kitty.Key): boolean {
    return key.name === "DOWN" && Boolean(key.super);
  }

  handle(key: kitty.Key) {
    this.editor.cursor.bottom(Boolean(key.shift));
  }
}

export class CursorPageUp extends InputHandler {
  match(key: kitty.Key): boolean {
    return key.name === "PAGE_UP";
  }

  handle(key: kitty.Key) {
    this.editor.cursor.up(this.editor.height, Boolean(key.shift));
  }
}

export class CursorPageDown extends InputHandler {
  match(key: kitty.Key): boolean {
    return key.name === "PAGE_DOWN";
  }

  handle(key: kitty.Key) {
    this.editor.cursor.down(this.editor.height, Boolean(key.shift));
  }
}

export class Enter extends InputHandler {
  match(key: kitty.Key): boolean {
    return key.name === "ENTER";
  }

  handle(_: kitty.Key) {
    const { cursor, buffer } = this.editor;

    if (cursor.isSelecting) {
      buffer.replace(cursor.from, cursor.to, "\n");
    } else {
      buffer.insert(cursor.pos, "\n");
    }
  }
}
