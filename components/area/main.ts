import { Component } from "@lib/ui";
import * as vt from "@lib/vt";

export class Area extends Component {
  constructor(
    public background: Uint8Array,
    resize: (_: Component, __: Component) => void,
  ) {
    super(resize);
  }

  render(): void {
    vt.buf.write(this.background);
    vt.clear_area(vt.buf, this);
  }
}
