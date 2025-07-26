import { Key } from "@lib/input";

import { KeyHandler } from "./handler.ts";

export class Down extends KeyHandler {
  keys = [
    { name: "DOWN" },
    { name: "DOWN", shift: true },
  ];

  handle({ shift }: Key): void {
    const { opts, cursor } = this.editor;

    if (opts.multi_line) {
      const select = Boolean(shift);

      cursor.move(1, 0, select);
    }
  }
}

export class PageUp extends KeyHandler {
  keys = [
    { name: "PAGE_UP" },
    { name: "PAGE_UP", shift: true },
  ];

  handle({ shift }: Key): void {
    const { opts, area, cursor } = this.editor;

    if (opts.multi_line) {
      const select = Boolean(shift);

      cursor.move(-area.h, 0, select);
    }
  }
}

export class PageDown extends KeyHandler {
  keys = [
    { name: "PAGE_DOWN" },
    { name: "PAGE_DOWN", shift: true },
  ];

  handle({ shift }: Key): void {
    const { opts, area, cursor } = this.editor;

    if (opts.multi_line) {
      const select = Boolean(shift);

      cursor.move(area.h, 0, select);
    }
  }
}

export class Top extends KeyHandler {
  keys = [
    { name: "UP", super: true },
    { name: "UP", super: true, shift: true },
  ];

  handle({ shift }: Key): void {
    const { opts, cursor } = this.editor;

    if (opts.multi_line) {
      const select = Boolean(shift);

      cursor.move(-Number.MAX_SAFE_INTEGER, 0, select);
    }
  }
}

export class Bottom extends KeyHandler {
  keys = [
    { name: "DOWN", super: true },
    { name: "DOWN", super: true, shift: true },
  ];

  handle({ shift }: Key): void {
    const { opts, cursor } = this.editor;

    if (opts.multi_line) {
      const select = Boolean(shift);

      cursor.move(Number.MAX_SAFE_INTEGER, 0, select);
    }
  }
}
