import { IRoot } from "@components/root";
import * as commands from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

const defaultColors = colors(DefaultTheme);

interface FooterParams {
  zen: boolean;
}

export class Footer extends ui.Component {
  #enabled = false;

  protected override children: {
    bg: ui.Bg;
    text: ui.Text;
  };

  constructor(
    private readonly root: IRoot,
    private readonly params: FooterParams,
  ) {
    super();

    this.children = {
      bg: new ui.Bg(defaultColors.background),
      text: new ui.Text(defaultColors.text, "right"),
    };

    this.#onZenChange();
  }

  override resizeChildren(): void {
    const { bg, text } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    vt.buf.write(vt.cursor.save);

    this.children.bg.render();

    const ln = this.root.ln + 1;
    const col = this.root.col + 1;
    const pct = this.root.lnCount === 0
      ? 0
      : ((ln / this.root.lnCount) * 100).toFixed(0);
    this.children.text.value = `${ln} ${col}  ${pct}% `;
    this.children.text.render();

    vt.buf.write(vt.cursor.restore);
  }

  override async handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme": {
        const c = colors(Themes[cmd.data]);

        this.children.bg.color = c.background;
        this.children.text.color = c.text;

        break;
      }
      case "Zen":
        this.params.zen = !this.params.zen;
        this.#onZenChange();
        this.root.isLayoutDirty = true;
        break;
    }
  }

  #onZenChange(): void {
    this.#enabled = !this.params.zen;
  }
}
