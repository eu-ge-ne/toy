import * as commands from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

const defaultColors = colors(DefaultTheme);

interface FooterState {
  disabled: boolean;
  ln: number;
  col: number;
  lnCount: number;
}

export class Footer extends ui.Component {
  protected override children: {
    bg: ui.Bg;
    text: ui.Text;
  };

  constructor(readonly state: FooterState) {
    super();

    this.children = {
      bg: new ui.Bg(defaultColors.background),
      text: new ui.Text(defaultColors.text, "right"),
    };
  }

  override resizeChildren(): void {
    const { bg, text } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    if (this.state.disabled) {
      return;
    }

    vt.buf.write(vt.cursor.save);

    this.children.bg.render();

    const ln = this.state.ln + 1;
    const col = this.state.col + 1;
    const pct = this.state.lnCount === 0
      ? 0
      : ((ln / this.state.lnCount) * 100).toFixed(0);
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
    }
  }
}
