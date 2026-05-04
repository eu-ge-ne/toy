import * as vt from "@libs/vt";

import { Frame } from "./frame.ts";
import { Widget } from "./widget.ts";

export abstract class Modal2<Props = void> extends Widget<Props> {
  render(): void {
    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);

    for (const child of Object.values(this.children)) {
      if (child instanceof Frame) {
        child.render();
      }
    }

    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();
  }
}
