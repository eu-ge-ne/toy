import * as themes from "@libs/themes";
import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";
import { BgWidget } from "@widgets/bg";
import { MultiLineText, TextWidget } from "@widgets/text";

export class AlertWidget extends widgets.Modal<[unknown]> {
  protected override children: {
    bg: BgWidget;
    text: MultiLineText;
    footer: TextWidget;
  };

  constructor() {
    super();

    this.children = {
      bg: new BgWidget(),
      text: new MultiLineText({ align: "left" }),
      footer: new TextWidget({ align: "center" }),
    };

    this.children.footer.value = "ENTER‧ok";
  }

  override resizeChildren(): void {
    const { bg, text, footer } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width - 4, this.height - 2, this.y + 1, this.x + 2);
    footer.resize(this.width, 1, this.y + this.height - 2, this.x);
  }

  async open(message: string): Promise<void> {
    this.children.text.value = message;

    while (true) {
      this.render();

      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
        case "ENTER":
          return;
      }
    }
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bgDanger);
    const text = new Uint8Array([...theme.bgDanger, ...theme.fgLight1]);

    this.children.bg.color = bg;
    this.children.text.color = text;
    this.children.footer.color = text;
  }
}
