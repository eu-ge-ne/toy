import * as kitty from "@libs/kitty";
import * as vt from "@libs/vt";

import { Frame } from "./frame.ts";
import { Widget } from "./widget.ts";

interface Props {
  opened: boolean;
}

export abstract class Modal2<P = {}> extends Widget<P & Props> {
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

  abstract onKeyPress(key: kitty.Key): void;
}
