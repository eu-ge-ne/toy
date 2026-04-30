import * as kitty from "@libs/kitty";
import * as vt from "@libs/vt";

import { Frame } from "./frame.ts";
import { Widget } from "./widget.ts";

export abstract class Modal<
  Props = void,
  Params extends unknown[] = [],
  Result = void,
> extends Widget<Props> {
  async open(...params: Params): Promise<Result> {
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

  protected abstract openBefore(..._: Params): Promise<void>;

  protected render(): void {
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

  protected abstract handleKey(key: kitty.Key): Promise<[] | [Result]>;
}
