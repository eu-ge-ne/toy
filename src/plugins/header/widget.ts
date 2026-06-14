import * as themes from "@libs/themes";
import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";

export class HeaderWidget extends widgets.Widget {
  fileName = "";
  modified = false;

  protected override children: {
    bg: widgets.Bg;
    text: widgets.SingleLineText;
  };

  constructor() {
    super();

    this.children = {
      bg: new widgets.Bg(),
      text: new widgets.SingleLineText({ align: "center" }),
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

    const f = this.modified ? " +" : "";
    this.children.text.value = `${this.fileName}${f}`;
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
