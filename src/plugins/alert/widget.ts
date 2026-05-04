import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";
import * as widgets from "@libs/widgets";
import { BgWidget } from "@widgets/bg";
import { MultiLineText, TextWidget } from "@widgets/text";

export class AlertWidget extends widgets.Modal2 {
  protected override children: {
    bg: BgWidget;
    text: MultiLineText;
    footer: TextWidget;
  };

  constructor() {
    super({
      opened: false,
    });

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

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bgDanger);
    const text = new Uint8Array([...theme.bgDanger, ...theme.fgLight1]);

    this.children.bg.color = bg;
    this.children.text.color = text;
    this.children.footer.color = text;
  }

  open(text: string): void {
    this.children.text.value = text;

    this.props.opened = true;
  }

  onKeyPress(key: kitty.Key): void {
    switch (key.name) {
      case "ESC":
      case "ENTER":
        this.props.opened = false;
    }
  }
}
