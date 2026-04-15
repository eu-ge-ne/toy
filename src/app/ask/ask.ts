import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

export class Ask extends ui.Modal<[string], boolean> {
  protected override children: {
    bg: ui.Bg;
    text: ui.MultiLineText;
    footer: ui.Text;
  };

  constructor() {
    super();

    this.children = {
      bg: new ui.Bg(),
      text: new ui.MultiLineText({ align: "center" }),
      footer: new ui.Text({ align: "center" }),
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
