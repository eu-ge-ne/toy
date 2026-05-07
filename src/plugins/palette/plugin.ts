import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { PaletteWidget } from "./widget.ts";

export function register(host: plugins.Host): void {
  const widget = new PaletteWidget();

  let zen = true;

  host.onReact("resize", () => {
    const { columns, rows } = Deno.consoleSize();

    if (zen) {
      widget.resize(columns, rows, 0, 0);
    } else {
      widget.resize(columns, rows - 2, 1, 0);
    }
  });

  host.onIntercept("command", async ({ cmd }) => {
    switch (cmd.name) {
      case "Zen":
        zen = !zen;
        return;

      case "Theme":
        widget.setTheme(themes.Themes[cmd.data]);
        return;

      case "Palette":
        await run();
        return;
    }
  });

  async function run(): Promise<void> {
    widget.open();

    const onRender = () => widget.render();

    const onKeyPress = async (data: { cancel?: boolean; key: kitty.Key }) => {
      data.cancel = true;

      widget.onKeyPress(data.key);

      if (!widget.opened) {
        host.offReact("render", onRender);
        host.offIntercept("key.press", onKeyPress);
        return;
      }

      host.resize2();
    };

    host.onReact("render", onRender, 1000);
    host.onIntercept("key.press", onKeyPress, -1000);

    host.resize2();

    await host.loop(() => widget.opened);

    const cmd = widget.result;
    if (cmd) {
      await host.command(cmd);
    }
  }
}
