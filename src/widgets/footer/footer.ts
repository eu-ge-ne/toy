import * as themes from "@libs/themes";
import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";
import { Bg } from "@widgets/bg";
import { Text } from "@widgets/text";

interface FooterProps {
  disabled: boolean;
  ln: number;
  col: number;
  lnCount: number;
}

export class Footer extends widgets.Frame {
  protected override children: {
    bg: Bg;
    text: Text;
  };

  constructor(readonly props: FooterProps) {
    super();

    this.children = {
      bg: new Bg(),
      text: new Text({ align: "right" }),
    };
  }

  override resizeChildren(): void {
    const { bg, text } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    if (this.props.disabled) {
      return;
    }

    vt.buf.write(vt.cursor.save);

    this.children.bg.render();

    const ln = this.props.ln + 1;
    const col = this.props.col + 1;
    const pct = this.props.lnCount === 0
      ? 0
      : ((ln / this.props.lnCount) * 100).toFixed(0);
    this.children.text.value = `${ln} ${col}  ${pct}% `;
    this.children.text.render();

    vt.buf.write(vt.cursor.restore);
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bgDark0);
    const text = new Uint8Array([...theme.bgDark0, ...theme.fgDark0]);

    this.children.bg.color = bg;
    this.children.text.color = text;
  }
}
