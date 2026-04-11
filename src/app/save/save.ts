import { Editor } from "@app/editor";
import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

export class Save extends ui.Modal<[string], string> {
  protected override children: {
    bg: ui.Bg;
    header: ui.Text;
    editor: Editor;
    footer: ui.Text;
  };

  constructor() {
    super();

    this.children = {
      bg: new ui.Bg(),
      header: new ui.Text({ align: "center" }),
      editor: new Editor({ multiLine: false }),
      footer: new ui.Text({ align: "center" }),
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

  async open(path: string): Promise<string> {
    const { editor } = this.children;

    editor.textBuf.reset(path);
    editor.reset(true);

    while (true) {
      this.render();

      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
          return "";
        case "ENTER": {
          const path = editor.textBuf.text();
          if (path) {
            return path;
          }
        }
      }

      editor.onKey(key);
    }
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bg_light1);
    const text = new Uint8Array([...theme.bg_light1, ...theme.fg_light1]);

    this.children.bg.color = bg;
    this.children.footer.color = text;
    this.children.editor.setTheme(theme);
  }
}
