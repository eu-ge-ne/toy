import { IRoot } from "@components/root";
import * as commands from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";
export * from "./colors.ts";

export class Header extends Component {
  #colors = colors(DefaultTheme);
  #area = new Area(this.#colors.background);
  #enabled = false;

  constructor(private readonly root: IRoot) {
    super();

    this.#onZen();
  }

  layout(): void {
    this.#area.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    const span: [number] = [this.width];

    vt.buf.write(vt.cursor.save);
    this.#area.render();
    vt.cursor.set(vt.buf, this.y, this.x);
    vt.buf.write(this.#colors.filePath);
    vt.write_text_center(vt.buf, span, this.root.filePath);

    if (this.root.isDirty) {
      vt.buf.write(this.#colors.isDirty);
      vt.write_text(vt.buf, span, " +");
    }

    vt.buf.write(vt.cursor.restore);
  }

  override async handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        this.#area.background = this.#colors.background;
        break;

      case "Zen":
        this.#onZen();
        this.root.isLayoutDirty = true;
        break;
    }
  }

  #onZen(): void {
    this.#enabled = !this.root.zen;
  }
}
