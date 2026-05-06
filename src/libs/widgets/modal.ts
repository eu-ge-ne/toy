import * as kitty from "@libs/kitty";
import * as vt from "@libs/vt";

import { Widget } from "./widget.ts";

export abstract class Modal<T = void> extends Widget<T> {
  opened = false;

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

  abstract onKeyPress(key: kitty.Key): void;
}
