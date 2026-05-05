import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AskWidget } from "./widget.ts";

export function register(host: plugins.Host): void {
  const widget = new AskWidget();

  host.onReact("resize", () => {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(60, 0, columns);
    const h = std.clamp(7, 0, rows);
    const y = Math.trunc((rows - h) / 2);
    const x = Math.trunc((columns - w) / 2);

    widget.resize(w, h, y, x);
  });

  host.onIntercept("command", async ({ cmd }) => {
    switch (cmd.name) {
      case "Theme":
        widget.setTheme(themes.Themes[cmd.data]);
        return;
    }
  });

  host.registerAsk({
    async open(message: string): Promise<boolean> {
      widget.open(message);

      const onRender = () => widget.render();

      const onKeyPress = async (data: { cancel?: boolean; key: kitty.Key }) => {
        data.cancel = true;

        widget.onKeyPress(data.key);

        if (!widget.props.opened) {
          host.offReact("render", onRender);
          host.offIntercept("key.press", onKeyPress);
          return;
        }
      };

      host.onReact("render", onRender, 1000);
      host.onIntercept("key.press", onKeyPress, -1000);

      await host.loop(() => widget.props.opened);

      return widget.props.result;
    },
  });
}
