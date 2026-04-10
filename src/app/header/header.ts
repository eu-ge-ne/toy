import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

interface HeaderProps {
  disabled: boolean;
  fileName: string;
  fileModified: boolean;
}

export class Header extends ui.Frame {
  protected override children: {
    bg: ui.Bg;
    text: ui.Text;
  };

  constructor(readonly props: HeaderProps) {
    super();

    this.children = {
      bg: new ui.Bg(),
      text: new ui.Text({ align: "center" }),
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

    const f = this.props.fileModified ? " +" : "";
    this.children.text.value = `${this.props.fileName}${f}`;
    this.children.text.render();

    vt.buf.write(vt.cursor.restore);
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bg_dark0);
    const text = new Uint8Array([...theme.bg_dark0, ...theme.fg_dark0]);

    this.children.bg.color = bg;
    this.children.text.color = text;
  }
}
