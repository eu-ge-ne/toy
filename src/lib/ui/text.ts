import * as vt from "@lib/vt";

import { Component } from "./component.ts";

const encoder = new TextEncoder();

interface TextParams {
  readonly align: "left" | "center" | "right";
}

export class Text extends Component {
  color = new Uint8Array();
  value = "";

  constructor(private readonly params: TextParams) {
    super();
  }

  render(): void {
    vt.buf.write(this.color);

    const t = this.value.slice(0, this.width);
    const b = encoder.encode(t);

    vt.cursor.set(vt.buf, this.y, this.x);

    switch (this.params.align) {
      case "center": {
        const n = Math.trunc((this.width - t.length) / 2);
        vt.write_spaces(vt.buf, n);
        break;
      }
      case "right": {
        const n = this.width - t.length;
        vt.write_spaces(vt.buf, n);
        break;
      }
    }

    vt.buf.write(b);
  }
}

export class MultiLineText extends Component {
  color = new Uint8Array();
  value = "";

  constructor(private readonly params: TextParams) {
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

      switch (this.params.align) {
        case "center": {
          const n = Math.trunc((this.width - t.length) / 2);
          vt.write_spaces(vt.buf, n);
          break;
        }
      }

      vt.buf.write(b);

      i += t.length;
    }
  }
}
