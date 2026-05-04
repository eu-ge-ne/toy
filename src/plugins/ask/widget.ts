import * as themes from "@libs/themes";
import * as widgets from "@libs/widgets";
import { BgWidget } from "@widgets/bg";
import { MultiLineText, TextWidget } from "@widgets/text";

export class AskWidget extends widgets.Modal2 {
  protected override children: {
    bg: BgWidget;
    text: MultiLineText;
    footer: TextWidget;
  };

  constructor() {
    super();

    this.children = {
      bg: new BgWidget(),
      text: new MultiLineText({ align: "center" }),
      footer: new TextWidget({ align: "center" }),
    };

    this.children.footer.value = "ESC‧no    ENTER‧yes";
  }

  override resizeChildren(): void {
    const { bg, text, footer } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width - 4, this.height - 2, this.y + 1, this.x + 2);
    footer.resize(this.width, 1, this.y + this.height - 2, this.x);
  }

  openBefore(text: string): void {
    this.children.text.value = text;
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bgLight1);
    const text = new Uint8Array([...theme.bgLight1, ...theme.fgLight1]);

    this.children.bg.color = bg;
    this.children.text.color = text;
    this.children.footer.color = text;
  }
}
