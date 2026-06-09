import * as buffers from "@libs/buffers";
import * as themes from "@libs/themes";
import * as widgets from "@libs/widgets";

export class AskFileNameWidget extends widgets.Modal {
  override children: {
    bg: widgets.Bg;
    header: widgets.SingleLineText;
    editor: widgets.Editor;
    footer: widgets.SingleLineText;
  };

  constructor(private readonly buffer: buffers.BufferAPI) {
    super();

    this.children = {
      bg: new widgets.Bg(),
      header: new widgets.SingleLineText({ align: "center" }),
      footer: new widgets.SingleLineText({ align: "center" }),
      editor: new widgets.Editor(this.buffer, { multiLine: false }),
    };

    this.children.header.value = "Save As";
    this.children.footer.value = "ESC‧cancel    ENTER‧ok";
  }

  override resizeChildren(): void {
    const { bg, header, editor, footer } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    header.resize(this.width, 1, this.y + 1, this.x);
    editor.resize(this.width - 4, 1, this.y + 4, this.x + 2);
    footer.resize(this.width, 1, this.y + this.height - 2, this.x);
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bgLight1);
    const text = new Uint8Array([...theme.bgLight1, ...theme.fgLight1]);

    this.children.bg.color = bg;
    this.children.header.color = text;
    this.children.footer.color = text;
    this.children.editor.setTheme(theme);
  }
}
