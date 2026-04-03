import * as commands from "@lib/commands";
import * as kitty from "@lib/kitty";
import { Component } from "@lib/ui";
import * as vt from "@lib/vt";

export class Area extends Component {
  constructor(public background: Uint8Array) {
    super();
  }

  layout(): void {
  }

  render(): void {
    vt.buf.write(this.background);

    vt.cursor.set(vt.buf, this.y, this.x);

    for (let i = this.height; i > 0; i -= 1) {
      vt.ech(vt.buf, this.width);

      vt.buf.write(vt.cursor.down);
    }
  }

  handleKey(_: kitty.Key): boolean {
    return false;
  }

  async handleCommand(_: commands.Command): Promise<void> {
  }
}
