import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

interface HeaderState {
  disabled: boolean;
  fileName: string;
  fileModified: boolean;
}

export class Header extends ui.Component {
  protected override children: {
    bg: ui.Bg;
    text: ui.Text;
  };

  constructor(readonly state: HeaderState) {
    super();

    this.children = {
      bg: new ui.Bg(new Uint8Array()),
      text: new ui.Text(new Uint8Array(), "center"),
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

    const f = this.state.fileModified ? " +" : "";
    this.children.text.value = `${this.state.fileName}${f}`;
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
