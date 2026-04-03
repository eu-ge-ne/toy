import * as vt from "@lib/vt";

import { Component } from "./component.ts";

export class Area extends Component {
  constructor(public bgColor: Uint8Array) {
    super();
  }

  render(): void {
    vt.buf.write(this.bgColor);

    vt.cursor.set(vt.buf, this.y, this.x);

    for (let i = this.height; i > 0; i -= 1) {
      vt.ech(vt.buf, this.width);

      vt.buf.write(vt.cursor.down);
    }
  }
}
