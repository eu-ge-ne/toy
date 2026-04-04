import * as vt from "@lib/vt";

import { Component } from "./component.ts";

const encoder = new TextEncoder();

type TextAlign = "left" | "center" | "right";

export class Text extends Component {
  value = "";

  constructor(public color: Uint8Array, protected align: TextAlign = "left") {
    super();
  }

  render(): void {
    vt.buf.write(this.color);

    vt.cursor.set(vt.buf, this.y, this.x);

    const t = this.value.slice(0, this.width);
    const b = encoder.encode(t);

    switch (this.align) {
      case "left": {
        vt.buf.write(b);
        break;
      }
      case "center": {
        const n = Math.trunc((this.width - t.length) / 2);
        vt.write_spaces(vt.buf, n);
        vt.buf.write(b);
        break;
      }
      case "right": {
        const n = this.width - t.length;
        vt.write_spaces(vt.buf, n);
        vt.buf.write(b);
        break;
      }
    }
  }
}

export class MultiLineText extends Component {
  value = "";

  constructor(public color: Uint8Array) {
    super();
  }

  render(): void {
    vt.buf.write(this.color);

    let i = 0;

    for (let y = 0; y < this.height; y += 1) {
      if (i >= this.value.length) {
        break;
      }

      const t = this.value.slice(i, i + this.width);
      const b = encoder.encode(t);

      vt.cursor.set(vt.buf, this.y + y, this.x);
      vt.buf.write(b);

      i += t.length;
    }
  }
}
