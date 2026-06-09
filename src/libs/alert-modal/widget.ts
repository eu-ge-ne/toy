import * as themes from "@libs/themes";
import * as widgets from "@libs/widgets";

export class AlertWidget extends widgets.Modal {
  override children: {
    bg: widgets.Bg;
    text: widgets.MultiLineText;
    footer: widgets.SingleLineText;
  };

  constructor() {
    super();

    this.children = {
      bg: new widgets.Bg(),
      text: new widgets.MultiLineText({ align: "left" }),
      footer: new widgets.SingleLineText({ align: "center" }),
    };

    this.children.footer.value = "ENTER‧ok";
  }

  override resizeChildren(): void {
    const { bg, text, footer } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width - 4, this.height - 2, this.y + 1, this.x + 2);
    footer.resize(this.width, 1, this.y + this.height - 2, this.x);
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bgDanger);
    const text = new Uint8Array([...theme.bgDanger, ...theme.fgLight1]);

    this.children.bg.color = bg;
    this.children.text.color = text;
    this.children.footer.color = text;
  }
}
