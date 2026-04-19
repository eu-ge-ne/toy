import * as themes from "@libs/themes";
import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";
import { Bg } from "@widgets/bg";
import { MultiLineText, Text } from "@widgets/text";

export class AskWidget extends widgets.Modal<[string], boolean> {
  protected override children: {
    bg: Bg;
    text: MultiLineText;
    footer: Text;
  };

  constructor() {
    super();

    this.children = {
      bg: new Bg(),
      text: new MultiLineText({ align: "center" }),
      footer: new Text({ align: "center" }),
    };

    this.children.footer.value = "ESC‧no    ENTER‧yes";
  }

  override resizeChildren(): void {
    const { bg, text, footer } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width - 4, this.height - 2, this.y + 1, this.x + 2);
    footer.resize(this.width, 1, this.y + this.height - 2, this.x);
  }

  async open(text: string): Promise<boolean> {
    this.children.text.value = text;

    while (true) {
      this.render();

      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
          return false;
        case "ENTER":
          return true;
      }
    }
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bgLight1);
    const text = new Uint8Array([...theme.bgLight1, ...theme.fgLight1]);

    this.children.bg.color = bg;
    this.children.text.color = text;
    this.children.footer.color = text;
  }
}
