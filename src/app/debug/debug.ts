import { IRoot } from "@components/root";
import { Command } from "@lib/commands";
import { DefaultTheme, Themes } from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { colors } from "./colors.ts";

const defaultColors = colors(DefaultTheme);
const MIB = Math.pow(1024, 2);

export class Debug extends ui.Component {
  #enabled = false;

  protected override children = {
    background: new ui.Background(defaultColors.background),
    line1: new ui.Text(defaultColors.text),
    line2: new ui.Text(defaultColors.text),
    line3: new ui.Text(defaultColors.text),
    line4: new ui.Text(defaultColors.text),
    line5: new ui.Text(defaultColors.text),
  };

  constructor(private readonly root: IRoot) {
    super();
  }

  override resizeChildren(): void {
    const { background, line1, line2, line3, line4, line5 } = this.children;

    background.resize(this.width, this.height, this.y, this.x);
    line1.resize(this.width - 2, 1, this.y + 1, this.x + 1);
    line2.resize(this.width - 2, 1, this.y + 2, this.x + 1);
    line3.resize(this.width - 2, 1, this.y + 3, this.x + 1);
    line4.resize(this.width - 2, 1, this.y + 4, this.x + 1);
    line5.resize(this.width - 2, 1, this.y + 5, this.x + 1);
  }

  render(): void {
    if (!this.#enabled) {
      return;
    }

    vt.buf.write(vt.cursor.save);

    const mem = Deno.memoryUsage();
    const rss = (mem.rss / MIB).toFixed();
    const heap_total = (mem.heapTotal / MIB).toFixed();
    const heap_used = (mem.heapUsed / MIB).toFixed();
    const external_mem = (mem.external / MIB).toFixed();

    this.children.background.render();

    const i = this.root.inputTime.toFixed(1);
    this.children.line1.value = `Input    : ${i} ms`;
    this.children.line1.render();

    const r = this.root.renderTime.toFixed(1);
    this.children.line2.value = `Render   : ${r} ms`;
    this.children.line2.render();

    this.children.line3.value = `RSS      : ${rss} MiB`;
    this.children.line3.render();

    this.children.line4.value = `Heap     : ${heap_used}/${heap_total} MiB`;
    this.children.line4.render();

    this.children.line5.value = `External : ${external_mem} MiB`;
    this.children.line5.render();

    vt.buf.write(vt.cursor.restore);
  }

  override async handleCommand(cmd: Command): Promise<void> {
    switch (cmd.name) {
      case "Theme": {
        const c = colors(Themes[cmd.data]);

        this.children.background.color = c.background;
        this.children.line1.color = c.text;
        this.children.line2.color = c.text;
        this.children.line3.color = c.text;
        this.children.line4.color = c.text;

        break;
      }
      case "Debug":
        this.#enabled = !this.#enabled;
        break;
    }
  }
}
