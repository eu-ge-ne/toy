import { Editor } from "@app/editor";
import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

interface SaveEvents {
  render: unknown;
}

export class Save extends ui.Frame<SaveEvents> {
  #enabled = false;

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
      editor: new Editor({
        disabled: false,
        index: false,
        multiLine: false,
        whitespace: false,
        wrap: false,
      }),
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

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.children.bg.render();
    this.children.header.render();
    this.children.footer.render();
    this.children.editor.render();
  }

  async run(path: string): Promise<string> {
    this.#enabled = true;

    this.children.editor.textBuf.reset(path);
    this.children.editor.reset(true);

    this.emit("render", undefined);

    const result = await this.#loop();

    this.#enabled = false;

    return result;
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bg_light1);
    const text = new Uint8Array([...theme.bg_light1, ...theme.fg_light1]);

    this.children.bg.color = bg;
    this.children.footer.color = text;
    this.children.editor.setTheme(theme);
  }

  async #loop(): Promise<string> {
    const { editor } = this.children;

    while (true) {
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

      this.emit("render", undefined);
    }
  }
}
