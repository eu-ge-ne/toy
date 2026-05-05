import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";
import * as widgets from "@libs/widgets";
import { BgWidget } from "@widgets/bg";
import { MultiLineText, TextWidget } from "@widgets/text";

export class AskWidget extends widgets.Modal<{ result: boolean }> {
  protected override children: {
    bg: BgWidget;
    text: MultiLineText;
    footer: TextWidget;
  };

  constructor() {
    super({
      opened: false,
      result: false,
    });

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

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bgLight1);
    const text = new Uint8Array([...theme.bgLight1, ...theme.fgLight1]);

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
        this.props.result = false;
        this.props.opened = false;
        return;
      case "ENTER":
        this.props.result = true;
        this.props.opened = false;
        return;
    }
  }
}
