import { Buffer } from "@libs/buffer";
import * as std from "@libs/std";
import * as themes from "@libs/themes";
import * as vt from "@libs/vt";

import { Widget } from "../widget.ts";
import { CharColor, charColor } from "./color.ts";
import { Cursor } from "./cursor.ts";

type WindowParams = {
  indexEnabled: boolean;
};

export class Window extends Widget {
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

  constructor(
    private readonly buffer: Buffer,
    private readonly cursor: Cursor,
    params: WindowParams,
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

  #indexWidth = 0;
  #textWidth = 0;
  #wrapWidth = 0;
  #scrollCol = 0;
  #scrollLn = 0;
  #cursorX = 0;
  #cursorY = 0;

  render(): void {
    this.#updateWidth();

    this.#scrollX();
    this.#scrollY();

    this.#renderLines();

    vt.cursor.set(vt.buf, this.#cursorY, this.#cursorX);
  }

  #updateWidth(): void {
    this.#indexWidth = 0;
    if (this.#mode.index && (this.buffer.lineCount > 0)) {
      this.#indexWidth = Math.trunc(Math.log10(this.buffer.lineCount)) + 3;
    }

    this.#textWidth = this.width - this.#indexWidth;

    this.#wrapWidth = this.#mode.wrap
      ? this.#textWidth
      : Number.MAX_SAFE_INTEGER;

    vt.wcharParams.y = this.y;
    vt.wcharParams.x = this.x + this.#indexWidth;
  }

  #scrollX(): void {
    const col = this.buffer.getWrapCol(
      this.#wrapWidth,
      this.cursor.pos.ln,
      this.cursor.pos.col,
    ) ?? this.cursor.pos.col;

    let width = 0;

    if (col <= this.#scrollCol) {
      this.#scrollCol = col;
    } else {
      const ww = this.buffer.lineGraphemesWidths(
        this.cursor.pos.ln,
        this.#scrollCol,
        col,
      );

      width = std.sum(ww);

      for (const w of ww) {
        if (width < this.#textWidth) {
          break;
        }

        this.#scrollCol += 1;
        width -= w;
      }
    }

    this.#cursorX = this.x + this.#indexWidth + width;
  }

  #scrollY(): void {
    if (this.#vScrollDelta <= 0) {
      this.#scrollLn = this.cursor.pos.ln;
    } else if (this.#vScrollDelta > this.height) {
      this.#scrollLn = this.cursor.pos.ln - this.height;
    }

    this.#cursorY = this.y;

    if (this.#vScrollDelta > 0) {
      const xs = std.range(this.#scrollLn, this.cursor.pos.ln + 1)
        .map((ln) => this.buffer.lineWrapHeight(this.#wrapWidth, ln));

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

    const wrapLn = this.buffer.getWrapLn(
      this.#wrapWidth,
      this.cursor.pos.ln,
      this.cursor.pos.col,
    );
    if (typeof wrapLn !== "undefined") {
      this.#cursorY += wrapLn;
    }
  }

  get #vScrollDelta(): number {
    return this.cursor.pos.ln - this.#scrollLn;
  }

  #renderLines(): void {
    const endY = this.y + this.height;

    let y = this.y;
    let ln = this.#scrollLn;

    while (y < endY) {
      y += this.#renderLn(y, ln);
      ln += 1;
    }
  }

  #renderLn(startY: number, startLn: number): number {
    if (startLn >= this.buffer.lineCount) {
      vt.cursor.set(vt.buf, startY, this.x);
      vt.buf.write(this.#color.void);
      vt.clearLine(vt.buf, this.width);
      return 1;
    }

    const endY = this.y + this.height;

    let y = startY;
    let availableWidth = 0;
    let currentColor = CharColor.Undefined;

    this.buffer.scanLineWrap(this.#wrapWidth, startLn, (gr, i, _, wrapCol) => {
      if (wrapCol === 0) {
        if (i > 0) {
          if ((y + 1) >= endY) {
            return true;
          } else {
            y += 1;
          }
        }

        vt.cursor.set(vt.buf, y, this.x);

        if (this.#indexWidth > 0) {
          if (i === 0) {
            vt.buf.write(this.#color.index);
            vt.writeText(
              vt.buf,
              [this.#indexWidth],
              `${startLn + 1} `.padStart(this.#indexWidth),
            );
          } else {
            vt.buf.write(this.#color.bg);
            vt.writeSpaces(vt.buf, this.#indexWidth);
          }
        }

        availableWidth = this.width - this.#indexWidth;
      }

      if ((wrapCol < this.#scrollCol) || (gr.width > availableWidth)) {
        return;
      }

      {
        const color = charColor(
          this.cursor.isSelected(startLn, i),
          gr.isVisible,
          this.#mode.whitespace,
        );

        if (color !== currentColor) {
          currentColor = color;
          vt.buf.write(this.#color.char[color]);
        }
      }

      vt.buf.write(gr.bytes);

      availableWidth -= gr.width;
    });

    return y - startY + 1;
  }
}
