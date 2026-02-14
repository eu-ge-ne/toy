import * as commands from "@lib/commands";
import { sprintf } from "@std/fmt/printf";

import { IRoot } from "@components/root";
import { DefaultTheme, Themes } from "@lib/themes";
import { Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export * from "./colors.ts";

export class Footer extends Component {
  #colors = colors(DefaultTheme);
  #enabled = false;

  constructor(private readonly root: IRoot) {
    super();

    this.#onZen();
  }

  layout(): void {
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    const ln = this.root.ln + 1;
    const col = this.root.col + 1;
    const pct = this.root.lnCount === 0
      ? 0
      : ((ln / this.root.lnCount) * 100).toFixed(0);
    const cursorStatus = `${ln} ${col}  ${pct}% `;

    vt.buf.write(vt.cursor.save);
    vt.buf.write(this.#colors.background);
    vt.clear_area(vt.buf, this);
    vt.buf.write(this.#colors.text);
    vt.write_text(
      vt.buf,
      [this.w],
      sprintf("%*s", this.w, cursorStatus),
    );
    vt.buf.write(vt.cursor.restore);
  }

  async handle(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
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
