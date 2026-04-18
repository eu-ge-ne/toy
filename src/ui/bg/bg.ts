import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

export class Bg extends ui.Frame {
  color = new Uint8Array();

  render(): void {
    vt.buf.write(this.color);

    vt.cursor.set(vt.buf, this.y, this.x);

    for (let i = this.height; i > 0; i -= 1) {
      vt.ech(vt.buf, this.width);

      vt.buf.write(vt.cursor.down);
    }
  }
}
