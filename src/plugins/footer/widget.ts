import * as themes from "@libs/themes";
import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";

type Pos = {
  ln: number;
  col: number;
};

export class FooterWidget extends widgets.Widget {
  pos: Pos = { ln: 0, col: 0 };
  from: Pos = { ln: 0, col: 0 };
  to: Pos = { ln: 0, col: 0 };
  lineCount = 0;

  protected override children: {
    bg: widgets.Bg;
    text: widgets.SingleLineText;
  };

  constructor() {
    super();

    this.children = {
      bg: new widgets.Bg(),
      text: new widgets.SingleLineText({ align: "right" }),
    };
  }

  override resizeChildren(): void {
    const { bg, text } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    vt.buf.write(vt.cursor.save);

    this.children.bg.render();

    const pct = this.lineCount === 0 ? 0 : ((this.pos.ln / this.lineCount) * 100).toFixed(0);

    this.children.text.value = `${this.pos.ln + 1}:${this.pos.col + 1}  ${this.from.ln + 1}:${
      this.from.col + 1
    } - ${this.to.ln + 1}:${this.to.col + 1}  ${pct}% `;

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
