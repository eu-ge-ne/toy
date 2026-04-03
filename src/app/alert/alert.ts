import { IRoot } from "@components/root";
import * as commands from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

export * from "./colors.ts";

export class Alert extends ui.Component {
  #colors = colors(DefaultTheme);
  #enabled = false;
  #text = "";

  protected override children = {
    background: new ui.Background(this.#colors.background),
    footer: new ui.Text(this.#colors.text, "center"),
  };

  constructor(private readonly root: IRoot) {
    super();

    this.children.footer.value = "ENTER‧ok";
  }

  override resizeChildren(): void {
    this.children.background.resize(this.width, this.height, this.y, this.x);

    this.children.footer.resize(
      this.width,
      1,
      this.y + this.height - 2,
      this.x,
    );
  }

  async run(err: unknown): Promise<void> {
    this.#text = Error.isError(err) ? err.message : Deno.inspect(err);

    this.#enabled = true;

    this.root.render();
    await this.#processInput();

    this.#enabled = false;
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.children.background.render();

    let pos = 0;

    for (let y = this.y + 1; y < this.y + this.height - 3; y += 1) {
      if (pos === this.#text.length) {
        break;
      }

      const span: [number] = [this.width - 4];
      const line = this.#text.slice(pos, pos + span[0]);

      pos += line.length;

      vt.cursor.set(vt.buf, y, this.x + 2);
      vt.buf.write(this.#colors.text);
      vt.write_text(vt.buf, span, line);
    }

    this.children.footer.render();
  }

  override async handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        this.children.background.color = this.#colors.background;
        this.children.footer.color = this.#colors.text;
        break;
    }
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
