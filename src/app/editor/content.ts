import * as chars from "@lib/chars";
import * as graphemes from "@lib/graphemes";
import * as std from "@lib/std";
import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { Cursor } from "./cursor.ts";

const enum CharColor {
  Undefined,
  Visible,
  Whitespace,
  Empty,
  VisibleSelected,
  WhitespaceSelected,
  EmptySelected,
}

export class Content extends ui.Frame {
  #focused = false;

  #mode = {
    index: false,
    whitespace: false,
    wrap: false,
  };

  #color = {
    bg: new Uint8Array(),
    void: new Uint8Array(),
    index: new Uint8Array(),
    char: {
      [CharColor.Undefined]: new Uint8Array(),
      [CharColor.Visible]: new Uint8Array(),
      [CharColor.Whitespace]: new Uint8Array(),
      [CharColor.Empty]: new Uint8Array(),
      [CharColor.VisibleSelected]: new Uint8Array(),
      [CharColor.WhitespaceSelected]: new Uint8Array(),
      [CharColor.EmptySelected]: new Uint8Array(),
    },
  };

  #indexWidth = 0;
  #textWidth = 0;
  #scrollLn = 0;
  #scrollCol = 0;
  #cursorY = 0;
  #cursorX = 0;

  constructor(
    private readonly charBuf: chars.Buf,
    private readonly grmBuf: graphemes.Buf,
    private readonly cursor: Cursor,
  ) {
    super();
  }

  render(): void {
    if (this.#mode.index && (this.charBuf.lineCount > 0)) {
      this.#indexWidth = Math.trunc(Math.log10(this.charBuf.lineCount)) + 3;
    } else {
      this.#indexWidth = 0;
    }

    this.#textWidth = this.width - this.#indexWidth;

    graphemes.settings.width = this.#mode.wrap
      ? this.#textWidth
      : Number.MAX_SAFE_INTEGER;

    graphemes.settings.y = this.#cursorY = this.y;
    graphemes.settings.x = this.#cursorX = this.x + this.#indexWidth;

    if (this.width >= this.#indexWidth) {
      this.#scrollV();
      this.#scrollH();
      this.#renderLines();
    }

    if (this.#focused) {
      vt.cursor.set(vt.buf, this.#cursorY, this.#cursorX);
    }
  }

  setTheme(theme: themes.Theme): void {
    this.#color.bg = new Uint8Array(theme.bg_main);
    this.#color.void = new Uint8Array(theme.bg_dark0);
    this.#color.index = new Uint8Array([
      ...theme.bg_light0,
      ...theme.fg_dark0,
    ]);
    this.#color.char = {
      [CharColor.Undefined]: new Uint8Array(),
      [CharColor.Visible]: new Uint8Array([
        ...theme.bg_main,
        ...theme.fg_light1,
      ]),
      [CharColor.Whitespace]: new Uint8Array([
        ...theme.bg_main,
        ...theme.fg_dark0,
      ]),
      [CharColor.Empty]: new Uint8Array([...theme.bg_main, ...theme.fg_main]),
      [CharColor.VisibleSelected]: new Uint8Array([
        ...theme.bg_light2,
        ...theme.fg_light1,
      ]),
      [CharColor.WhitespaceSelected]: new Uint8Array([
        ...theme.bg_light2,
        ...theme.fg_dark1,
      ]),
      [CharColor.EmptySelected]: new Uint8Array([
        ...theme.bg_light2,
        ...theme.fg_dark1,
      ]),
    };
  }

  setFocused(x: boolean): void {
    this.#focused = x;
  }

  toggleWrapped(): void {
    this.#mode.wrap = !this.#mode.wrap;
  }

  toggleWhitespace(): void {
    this.#mode.whitespace = !this.#mode.whitespace;
  }

  toggleIndex(): void {
    this.#mode.index = !this.#mode.index;
  }

  #renderLines(): void {
    let row = this.y;

    for (let ln = this.#scrollLn;; ln += 1) {
      if (ln < this.charBuf.lineCount) {
        row = this.#renderLine(ln, row);
      } else {
        vt.cursor.set(vt.buf, row, this.x);
        vt.buf.write(this.#color.void);
        vt.clear_line(vt.buf, this.width);
      }

      row += 1;
      if (row >= this.y + this.height) {
        break;
      }
    }
  }

  #scrollV(): void {
    const delta_ln = this.cursor.ln - this.#scrollLn;

    // Above?
    if (delta_ln <= 0) {
      this.#scrollLn = this.cursor.ln;
      return;
    }

    // Below?

    if (delta_ln > this.height) {
      this.#scrollLn = this.cursor.ln - this.height;
    }

    const xs = std.range(this.#scrollLn, this.cursor.ln + 1).map((ln) =>
      this.grmBuf.line(ln)
        .reduce((a, { i, col }) => a + (i > 0 && col === 0 ? 1 : 0), 1)
    );

    let i = 0;
    let height = std.sum(xs);

    while (height > this.height) {
      height -= xs[i]!;
      this.#scrollLn += 1;
      i += 1;
    }

    while (i < xs.length - 1) {
      this.#cursorY += xs[i]!;
      i += 1;
    }
  }

  #scrollH(): void {
    const cell =
      this.grmBuf.line(this.cursor.ln, true).drop(this.cursor.col).next().value;
    if (cell) {
      this.#cursorY += cell.ln;
    }

    const col = cell?.col ?? 0; // col = f(cursor.col)
    const delta_col = col - this.#scrollCol;

    // Before?
    if (delta_col <= 0) {
      this.#scrollCol = col;
      return;
    }

    // After?

    const xs = this.grmBuf.line(this.cursor.ln, true)
      .drop(this.cursor.col - delta_col)
      .take(delta_col)
      .map((x) => x.gr.width)
      .toArray();

    let width = std.sum(xs);

    for (const w of xs) {
      if (width < this.#textWidth) {
        break;
      }

      this.#scrollCol += 1;
      width -= w;
    }

    this.#cursorX += width;
  }

  #renderLine(ln: number, row: number): number {
    let available_w = 0;
    let current_color = CharColor.Undefined;

    const xs = this.grmBuf.line(ln);

    for (const { gr: { width, isVisible, bytes }, i, col } of xs) {
      if (col === 0) {
        if (i > 0) {
          row += 1;
          if (row >= this.y + this.height) {
            return row;
          }
        }

        vt.cursor.set(vt.buf, row, this.x);

        if (this.#indexWidth > 0) {
          if (i === 0) {
            vt.buf.write(this.#color.index);
            vt.write_text(
              vt.buf,
              [this.#indexWidth],
              `${ln + 1} `.padStart(this.#indexWidth),
            );
          } else {
            vt.buf.write(this.#color.bg);
            vt.write_spaces(vt.buf, this.#indexWidth);
          }
        }

        available_w = this.width - this.#indexWidth;
      }

      if ((col < this.#scrollCol) || (width > available_w)) {
        continue;
      }

      const color = charColor(
        this.cursor.isSelected(ln, i),
        isVisible,
        this.#mode.whitespace,
      );

      if (color !== current_color) {
        current_color = color;
        vt.buf.write(this.#color.char[color]);
      }

      vt.buf.write(bytes);

      available_w -= width;
    }

    return row;
  }
}

function charColor(
  isSelected: boolean,
  isVisible: boolean,
  whitespaceEnabled: boolean,
): CharColor {
  if (isSelected) {
    if (isVisible) {
      return CharColor.VisibleSelected;
    } else if (whitespaceEnabled) {
      return CharColor.WhitespaceSelected;
    } else {
      return CharColor.EmptySelected;
    }
  } else {
    if (isVisible) {
      return CharColor.Visible;
    } else if (whitespaceEnabled) {
      return CharColor.Whitespace;
    } else {
      return CharColor.Empty;
    }
  }
}
