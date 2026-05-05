import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { PaletteWidget } from "./widget.ts";

export function register(host: plugins.Host): void {
  const widget = new PaletteWidget(
    /*{
    onRender: () => {
      host.resize();
      host.render();
    },
  }*/
  );

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
        host.resize();
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

      if (!widget.props.opened) {
        host.offReact("render", onRender);
        host.offIntercept("key.press", onKeyPress);
        return;
      }

      host.resize();
    };

    host.onReact("render", onRender, 1000);
    host.onIntercept("key.press", onKeyPress, -1000);

    host.resize();

    await host.loop(() => widget.props.opened);

    const cmd = widget.props.result;
    if (cmd) {
      await host.command(cmd);
    }
  }
}
