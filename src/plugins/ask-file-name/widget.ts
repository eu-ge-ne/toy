import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";
import * as widgets from "@libs/widgets";
import { BgWidget } from "@widgets/bg";
import { EditorWidget } from "@widgets/editor";
import { TextWidget } from "@widgets/text";

export class AskFileNameWidget
  extends widgets.Modal2<{ result: string | undefined }> {
  protected override children: {
    bg: BgWidget;
    header: TextWidget;
    editor: EditorWidget;
    footer: TextWidget;
  };

  constructor() {
    super({
      opened: false,
      result: undefined,
    });

    this.children = {
      bg: new BgWidget(),
      header: new TextWidget({ align: "center" }),
      footer: new TextWidget({ align: "center" }),
      editor: new EditorWidget({ multiLine: false }),
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

  open(path: string): void {
    const { editor } = this.children;

    editor.setFocused(true);
    editor.text = path;
    editor.resetChanges();
    editor.resetCursor();

    this.props.opened = true;
  }

  onKeyPress(key: kitty.Key): void {
    const { editor } = this.children;

    switch (key.name) {
      case "ESC":
        this.props.result = undefined;
        this.props.opened = false;
        return;
      case "ENTER": {
        const path = editor.text;
        if (path) {
          this.props.result = path;
          this.props.opened = false;
          return;
        }
      }
    }

    editor.onKey(key);
  }
}
