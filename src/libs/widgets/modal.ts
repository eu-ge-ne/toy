import * as vt from "@libs/vt";

import { Widget } from "./widget.ts";

export abstract class Modal<T = void> extends Widget<T> {
  render(): void {
    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);

    for (const child of Object.values(this.children)) {
      child.render();
    }

    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();
  }
}
