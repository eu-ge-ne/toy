import * as themes from "@libs/themes";
import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";
import { BgWidget } from "@widgets/bg";
import { EditorWidget } from "@widgets/editor";
import { TextWidget } from "@widgets/text";

export class SaveAsWidget extends widgets.Modal<[string], string> {
  protected override children: {
    bg: BgWidget;
    header: TextWidget;
    editor: EditorWidget;
    footer: TextWidget;
  };

  constructor() {
    super();

    this.children = {
      bg: new BgWidget(),
      header: new TextWidget({ align: "center" }),
      editor: new EditorWidget({ multiLine: false }),
      footer: new TextWidget({ align: "center" }),
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

    editor.setFocused(true);
    editor.text = path;
    editor.resetChanges();
    editor.resetCursor();

    while (true) {
      this.render();

      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
          return "";
        case "ENTER": {
          const path = editor.text;
          if (path) {
            return path;
          }
        }
      }

      editor.onKey(key);
    }
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bgLight1);
    const text = new Uint8Array([...theme.bgLight1, ...theme.fgLight1]);

    this.children.bg.color = bg;
    this.children.footer.color = text;
    this.children.editor.setTheme(theme);
  }
}
