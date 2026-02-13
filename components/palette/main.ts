import { Editor } from "@components/editor";
import { IRoot } from "@components/root";
import { Command } from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";
import { Option, options } from "./options.ts";

export * from "./colors.ts";

const MAX_LIST_SIZE = 10;

export class Palette extends Component<[], Command | undefined> {
  #colors = colors(DefaultTheme);
  #enabled = false;
  #pa: Area = { y: 0, x: 0, w: 0, h: 0 };
  #editor: Editor;

  #filtered_options: Option[] = [];
  #list_size = 0;
  #selected_index = 0;
  #scroll_index = 0;

  constructor(private readonly root: IRoot) {
    super();

    this.#editor = new Editor(root, { multiLine: false });
  }

  async run(): Promise<Command | undefined> {
    this.#enabled = true;
    this.#editor.enable(true);

    this.#editor.buffer.buf.reset();
    this.#editor.reset(false);

    this.#filter();
    this.root.render();

    const cmd = await this.#processInput();

    this.#enabled = false;
    this.#editor.enable(false);

    return cmd;
  }

  layout(p: Area): void {
    this.#pa = p;
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    this.#resize();
    this.#scroll();

    vt.sync.bsu();

    vt.buf.write(vt.cursor.hide);
    vt.buf.write(this.#colors.background);
    vt.clear_area(vt.buf, this);

    if (this.#filtered_options.length === 0) {
      this.#render_empty();
    } else {
      this.#render_options();
    }

    this.#editor.render();

    vt.sync.esu();
  }

  async handle(cmd: Command): Promise<void> {
    switch (cmd.name) {
      case "Theme":
        this.#colors = colors(Themes[cmd.data]);
        break;
    }
  }

  async #processInput(): Promise<Command | undefined> {
    while (true) {
      const key = await vt.readKey();

      switch (key.name) {
        case "ESC":
          return;
        case "ENTER":
          return this.#filtered_options[this.#selected_index]?.command;
        case "UP":
          if (this.#filtered_options.length > 0) {
            this.#selected_index = Math.max(this.#selected_index - 1, 0);
            this.root.render();
          }
          continue;
        case "DOWN":
          if (this.#filtered_options.length > 0) {
            this.#selected_index = Math.min(
              this.#selected_index + 1,
              this.#filtered_options.length - 1,
            );
            this.root.render();
          }
          continue;
      }

      this.#editor.handleKey(key);
      this.#filter();
      this.root.render();
    }
  }

  #filter(): void {
    const text = this.#editor.buffer.buf.text().toUpperCase();

    if (!text) {
      this.#filtered_options = options;
    } else {
      this.#filtered_options = options.filter((x) =>
        x.name.toUpperCase().includes(text)
      );
    }

    this.#selected_index = 0;
  }

  #resize(): void {
    this.#list_size = Math.min(this.#filtered_options.length, MAX_LIST_SIZE);

    this.w = Math.min(60, this.#pa.w);

    this.h = 3 + Math.max(this.#list_size, 1);
    if (this.h > this.#pa.h) {
      this.h = this.#pa.h;
      if (this.#list_size > 0) {
        this.#list_size = this.h - 3;
      }
    }

    this.y = this.#pa.y + Math.trunc((this.#pa.h - this.h) / 2);
    this.x = this.#pa.x + Math.trunc((this.#pa.w - this.w) / 2);

    this.#editor.layout({
      y: this.y + 1,
      x: this.x + 2,
      w: this.w - 4,
      h: 1,
    });
  }

  #scroll(): void {
    const delta = this.#selected_index - this.#scroll_index;
    if (delta < 0) {
      this.#scroll_index = this.#selected_index;
    } else if (delta >= this.#list_size) {
      this.#scroll_index = this.#selected_index - this.#list_size + 1;
    }
  }

  #render_empty(): void {
    vt.cursor.set(vt.buf, this.y + 2, this.x + 2);
    vt.buf.write(this.#colors.option);
    vt.write_text(vt.buf, [this.w - 4], "No matching commands");
  }

  #render_options(): void {
    let i = 0;
    let y = this.y + 2;

    while (true) {
      if (i === this.#list_size) {
        break;
      }
      const index = this.#scroll_index + i;
      const option = this.#filtered_options[index];
      if (!option) {
        break;
      }
      if (y === this.y + this.h) {
        break;
      }

      const span: [number] = [this.w - 4];

      vt.buf.write(
        index === this.#selected_index
          ? this.#colors.selectedOption
          : this.#colors.option,
      );
      vt.cursor.set(vt.buf, y, this.x + 2);
      vt.write_text(vt.buf, span, option.name);
      vt.write_text(
        vt.buf,
        span,
        (option.shortcuts ?? []).join(" ").padStart(span[0]),
      );

      i += 1;
      y += 1;
    }
  }
}
