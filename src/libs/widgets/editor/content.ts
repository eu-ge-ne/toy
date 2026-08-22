import { Buffer } from "@libs/buffer";
import * as std from "@libs/std";
import * as themes from "@libs/themes";
import * as vt from "@libs/vt";

import { Widget } from "../widget.ts";
import { CharColor, charColor } from "./color.ts";
import { Cursor } from "./cursor.ts";

type ContentParams = {
  indexEnabled: boolean;
};

export class Content extends Widget {
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
    private readonly buffer: Buffer,
    private readonly cursor: Cursor,
    params: ContentParams,
  ) {
    super();

    this.#mode.index = params.indexEnabled;
  }

  setTheme(theme: themes.Theme): void {
    this.#color.bg = new Uint8Array(theme.bgMain);
    this.#color.void = new Uint8Array(theme.bgDark0);
    this.#color.index = new Uint8Array([...theme.bgLight0, ...theme.fgDark0]);
    this.#color.char = {
      [CharColor.Undefined]: new Uint8Array(),
      [CharColor.Visible]: new Uint8Array([...theme.bgMain, ...theme.fgLight1]),
      [CharColor.Whitespace]: new Uint8Array([
        ...theme.bgMain,
        ...theme.fgDark0,
      ]),
      [CharColor.Empty]: new Uint8Array([...theme.bgMain, ...theme.fgMain]),
      [CharColor.VisibleSelected]: new Uint8Array([
        ...theme.bgLight2,
        ...theme.fgLight1,
      ]),
      [CharColor.WhitespaceSelected]: new Uint8Array([
        ...theme.bgLight2,
        ...theme.fgDark1,
      ]),
      [CharColor.EmptySelected]: new Uint8Array([
        ...theme.bgLight2,
        ...theme.fgDark1,
      ]),
    };
  }

  toggleWrap(): void {
    this.#mode.wrap = !this.#mode.wrap;
  }

  toggleWhitespace(): void {
    this.#mode.whitespace = !this.#mode.whitespace;
  }

  toggleIndex(): void {
    this.#mode.index = !this.#mode.index;
  }

  get #vScrollDelta(): number {
    return this.cursor.pos.ln - this.#scrollLn;
  }

  render(): void {
    this.#indexWidth = 0;
    if (this.#mode.index && (this.buffer.lineCount > 0)) {
      this.#indexWidth = Math.trunc(Math.log10(this.buffer.lineCount)) + 3;
    }

    this.#textWidth = this.width - this.#indexWidth;

    this.buffer.width = this.#mode.wrap
      ? this.#textWidth
      : Number.MAX_SAFE_INTEGER;

    vt.wcharParams.y = this.y;
    vt.wcharParams.x = this.x + this.#indexWidth;

    this.#cursorY = this.y;
    this.#cursorX = this.x + this.#indexWidth;

    this.#scrollH();

    if (this.#vScrollDelta <= 0) {
      this.#scrollLn = this.cursor.pos.ln;
    } else if (this.#vScrollDelta > this.height) {
      this.#scrollLn = this.cursor.pos.ln - this.height;
    }

    this.#scrollV();
    this.#renderLines();

    vt.cursor.set(vt.buf, this.#cursorY, this.#cursorX);
  }

  #scrollH(): void {
    const cell =
      this.buffer.lineCells(this.cursor.pos.ln, true).drop(this.cursor.pos.col)
        .next().value;
    if (cell) {
      this.#cursorY += cell.ln;
    }

    const col = cell?.col ?? 0; // col = f(cursor.col)
    const deltaCol = col - this.#scrollCol;

    // Before?
    if (deltaCol <= 0) {
      this.#scrollCol = col;
      return;
    }

    // After?

    const xs = this.buffer.lineCells(this.cursor.pos.ln, true)
      .drop(this.cursor.pos.col - deltaCol)
      .take(deltaCol)
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

  #scrollV(): void {
    if (this.#vScrollDelta <= 0) {
      return;
    }

    const xs = std.range(this.#scrollLn, this.cursor.pos.ln + 1)
      .map((ln) => this.buffer.lineHeight(ln));

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

  #renderLines(): void {
    let row = this.y;

    for (let ln = this.#scrollLn;; ln += 1) {
      if (ln < this.buffer.lineCount) {
        row = this.#renderLine(ln, row);
      } else {
        vt.cursor.set(vt.buf, row, this.x);
        vt.buf.write(this.#color.void);
        vt.clearLine(vt.buf, this.width);
      }

      row += 1;
      if (row >= this.y + this.height) {
        break;
      }
    }
  }

  #renderLine(ln: number, row: number): number {
    let availableWidth = 0;
    let currentColor = CharColor.Undefined;

    for (
      const { gr: { width, isVisible, bytes }, i, col } of this.buffer
        .lineCells(ln)
    ) {
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
            vt.writeText(
              vt.buf,
              [this.#indexWidth],
              `${ln + 1} `.padStart(this.#indexWidth),
            );
          } else {
            vt.buf.write(this.#color.bg);
            vt.writeSpaces(vt.buf, this.#indexWidth);
          }
        }

        availableWidth = this.width - this.#indexWidth;
      }

      if ((col < this.#scrollCol) || (width > availableWidth)) {
        continue;
      }

      const color = charColor(
        this.cursor.isSelected(ln, i),
        isVisible,
        this.#mode.whitespace,
      );

      if (color !== currentColor) {
        currentColor = color;
        vt.buf.write(this.#color.char[color]);
      }

      vt.buf.write(bytes);

      availableWidth -= width;
    }

    return row;
  }
}
