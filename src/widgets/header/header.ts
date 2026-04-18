import * as themes from "@lib/themes";
import * as vt from "@lib/vt";
import * as widgets from "@lib/widgets";
import { Bg } from "@widgets/bg";
import { Text } from "@widgets/text";

interface HeaderProps {
  disabled: boolean;
  fileName: string;
  fileModified: boolean;
}

export class Header extends widgets.Frame {
  protected override children: {
    bg: Bg;
    text: Text;
  };

  constructor(readonly props: HeaderProps) {
    super();

    this.children = {
      bg: new Bg(),
      text: new Text({ align: "center" }),
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
    const bg = new Uint8Array(theme.bgDark0);
    const text = new Uint8Array([...theme.bgDark0, ...theme.fgDark0]);

    this.children.bg.color = bg;
    this.children.text.color = text;
  }
}
