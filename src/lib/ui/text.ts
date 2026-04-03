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
