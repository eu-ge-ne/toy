import * as kitty from "@libs/kitty";
import * as vt from "@libs/vt";

import { Frame } from "./frame.ts";
import { Widget } from "./widget.ts";

export abstract class Modal<P extends unknown[] = [], R = void> extends Widget {
  async open(...params: P): Promise<R> {
    await this.openBefore(...params);

    while (true) {
      this.render();

      const key = await vt.readKey();

      const result = await this.handleKey(key);
      if (result.length === 1) {
        return result[0];
      }
    }
  }

  protected abstract openBefore(..._: P): Promise<void>;

  protected render(): void {
    this.renderBefore();

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

  protected renderBefore(): void {
  }

  protected abstract handleKey(key: kitty.Key): Promise<[] | [R]>;
}
