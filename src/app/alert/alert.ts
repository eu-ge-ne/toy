import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

interface AlertEvents {
  render: unknown;
}

export class Alert extends ui.Component<AlertEvents> {
  #enabled = false;

  protected override children: {
    bg: ui.Bg;
    text: ui.MultiLineText;
    footer: ui.Text;
  };

  constructor() {
    super();

    this.children = {
      bg: new ui.Bg(),
      text: new ui.MultiLineText({ align: "left" }),
      footer: new ui.Text({ align: "center" }),
    };

    this.children.footer.value = "ENTER‧ok";
  }

  override resizeChildren(): void {
    const { bg, text, footer } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width - 4, this.height - 2, this.y + 1, this.x + 2);
    footer.resize(this.width, 1, this.y + this.height - 2, this.x);
  }

  async run(err: unknown): Promise<void> {
    this.children.text.value = Error.isError(err)
      ? err.message
      : Deno.inspect(err);

    this.#enabled = true;

    this.emit("render", undefined);

    await this.#processInput();

    this.#enabled = false;
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
    const bg = new Uint8Array(theme.bg_danger);
    const text = new Uint8Array([...theme.bg_danger, ...theme.fg_light1]);

    this.children.bg.color = bg;
    this.children.text.color = text;
    this.children.footer.color = text;
  }

  async #processInput(): Promise<void> {
    while (true) {
      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
        case "ENTER":
          return;
      }
    }
  }
}
