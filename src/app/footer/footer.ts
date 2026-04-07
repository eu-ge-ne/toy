import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

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
      bg: new ui.Bg(new Uint8Array()),
      text: new ui.Text({ align: "right" }),
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

  setTheme(theme: themes.Theme): void {
    const bg = theme.bg_dark0;
    const text = new Uint8Array([...theme.bg_dark0, ...theme.fg_dark0]);

    this.children.bg.color = bg;
    this.children.text.color = text;
  }
}
