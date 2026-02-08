import { Command } from "@lib/commands";
import { Globals } from "@lib/globals";
import { DefaultTheme, Themes } from "@lib/themes";
import { Area, Component } from "@lib/ui";
import * as vt from "@lib/vt";
import { Editor } from "@ui/editor";

import { colors } from "./colors.ts";
import { Option, options } from "./options.ts";

const MAX_LIST_SIZE = 10;

export class Palette extends Component<Globals, [], Command | undefined> {
  #colors = colors(DefaultTheme);
  #enabled = false;
  #parentArea: Area = { y: 0, x: 0, w: 0, h: 0 };
  #editor: Editor;

  #filtered_options: Option[] = [];
  #list_size = 0;
  #selected_index = 0;
  #scroll_index = 0;

  constructor(globals: Globals) {
    super(globals);

    this.#editor = new Editor(globals, { multiLine: false });
  }

  async run(): Promise<Command | undefined> {
    this.#enabled = true;
    this.#editor.enable(true);

    this.#editor.buffer.reset();
    this.#editor.reset(false);

    this.#filter();
    this.globals.renderTree();

    const cmd = await this.#processInput();

    this.#enabled = false;
    this.#editor.enable(false);

    return cmd;
  }

  resize(p: Area): void {
    this.#parentArea.y = p.y;
    this.#parentArea.x = p.x;
    this.#parentArea.w = p.w;
    this.#parentArea.h = p.h;
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
    vt.clear_area(vt.buf, this.area);

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
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.globals.renderTree();
          continue;
        }

        switch (key.name) {
          case "ESC":
            return;
          case "ENTER":
            return this.#filtered_options[this.#selected_index]?.command;
          case "UP":
            if (this.#filtered_options.length > 0) {
              this.#selected_index = Math.max(this.#selected_index - 1, 0);
              this.globals.renderTree();
            }
            continue;
          case "DOWN":
            if (this.#filtered_options.length > 0) {
              this.#selected_index = Math.min(
                this.#selected_index + 1,
                this.#filtered_options.length - 1,
              );
              this.globals.renderTree();
            }
            continue;
        }

        this.#editor.handleKey(key);
        this.#filter();
        this.globals.renderTree();
      }
    }
  }

  #filter(): void {
    const text = this.#editor.buffer.text().toUpperCase();

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

    this.area.w = Math.min(60, this.#parentArea.w);

    this.area.h = 3 + Math.max(this.#list_size, 1);
    if (this.area.h > this.#parentArea.h) {
      this.area.h = this.#parentArea.h;
      if (this.#list_size > 0) {
        this.#list_size = this.area.h - 3;
      }
    }

    this.area.y = this.#parentArea.y +
      Math.trunc((this.#parentArea.h - this.area.h) / 2);
    this.area.x = this.#parentArea.x +
      Math.trunc((this.#parentArea.w - this.area.w) / 2);

    this.#editor.resize({
      y: this.area.y + 1,
      x: this.area.x + 2,
      w: this.area.w - 4,
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
    vt.cursor.set(vt.buf, this.area.y + 2, this.area.x + 2);
    vt.buf.write(this.#colors.option);
    vt.write_text(vt.buf, [this.area.w - 4], "No matching commands");
  }

  #render_options(): void {
    let i = 0;
    let y = this.area.y + 2;

    while (true) {
      if (i === this.#list_size) {
        break;
      }
      const index = this.#scroll_index + i;
      const option = this.#filtered_options[index];
      if (!option) {
        break;
      }
      if (y === this.area.y + this.area.h) {
        break;
      }

      const span: [number] = [this.area.w - 4];

      vt.buf.write(
        index === this.#selected_index
          ? this.#colors.selectedOption
          : this.#colors.option,
      );
      vt.cursor.set(vt.buf, y, this.area.x + 2);
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
