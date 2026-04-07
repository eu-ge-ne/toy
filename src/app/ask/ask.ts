import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

interface AskEvents {
  render: unknown;
}

export class Ask extends ui.Component<AskEvents> {
  #enabled = false;

  protected override children: {
    bg: ui.Bg;
    text: ui.MultiLineText;
    footer: ui.Text;
  };

  constructor() {
    super();

    this.children = {
      bg: new ui.Bg(new Uint8Array()),
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

  async run(text: string): Promise<boolean> {
    this.children.text.value = text;

    this.#enabled = true;

    this.emit("render", undefined);

    const result = await this.#processInput();

    this.#enabled = false;

    return result;
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.children.bg.render();
    this.children.text.render();
    this.children.footer.render();
  }

  setTheme(theme: themes.Theme): void {
    const bg = theme.bg_light1;
    const text = new Uint8Array([...theme.bg_light1, ...theme.fg_light1]);

    this.children.bg.color = bg;
    this.children.text.color = text;
    this.children.footer.color = text;
  }

  async #processInput(): Promise<boolean> {
    while (true) {
      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
          return false;
        case "ENTER":
          return true;
      }
    }
  }
}
