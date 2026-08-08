import * as buffer from "@plugins/buffer";
import * as core from "@plugins/core";
import * as themes from "@plugins/themes";
import * as view from "@plugins/view";
import * as zen from "@plugins/zen";

import { FooterWidget } from "./widget.ts";

type Pos = {
  ln: number;
  col: number;
};

export function Plugin(
  api: core.API & themes.API & buffer.API & zen.API & view.API,
): void {
  let lineCount = 0;
  let pos: Pos = { ln: 0, col: 0 };
  let from: Pos = { ln: 0, col: 0 };
  let to: Pos = { ln: 0, col: 0 };

  const widget = new FooterWidget();

  api.core.signals.on("resize")(() => {
    const { columns, rows } = Deno.consoleSize();

    widget.resize(columns, 1, rows - 1, 0);
  });

  api.core.signals.on("render")(() => {
    if (api.zen.enabled) {
      return;
    }

    widget.render();
  });

  api.theme.signals.on("change")((x) => widget.setTheme(x));

  api.buffer.signals.on("buffer.change")(() => {
    lineCount = api.buffer.lineCount;

    update();
  });

  api.view.cursor.signals.on("cursor.change")(() => {
    const cursor = api.view.cursor;

    pos = cursor.pos;
    from = cursor.from;
    to = cursor.to;

    update();
  });

  function update(): void {
    const text = widget.children.text;

    const pct = lineCount === 0 ? 0 : ((pos.ln / lineCount) * 100).toFixed(0);

    if (from.ln === to.ln && from.col === to.col) {
      text.value = `${pos.ln + 1}:${pos.col + 1} ${pct}% `;
    } else {
      text.value = `${from.ln + 1}:${from.col + 1}-${to.ln + 1}:${
        to.col + 1
      } ${pct}% `;
    }
  }
}
