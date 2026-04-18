import { Document } from "@libs/document";
import * as graphemes from "@libs/graphemes";
import * as std from "@libs/std";
import * as themes from "@libs/themes";
import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";

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

export class Content extends widgets.Frame {
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

  #scrollLn = 0;
  #scrollCol = 0;
  #cursorY = 0;
  #cursorX = 0;

  constructor(
    private readonly doc: Document,
    private readonly gDoc: graphemes.Document,
    private readonly cursor: Cursor,
  ) {
    super();
  }

  render(): void {
    let indexWidth = 0;
    if (this.#mode.index && (this.doc.lineCount > 0)) {
      indexWidth = Math.trunc(Math.log10(this.doc.lineCount)) + 3;
    }

    const textWidth = this.width - indexWidth;

    graphemes.settings.width = this.#mode.wrap
      ? textWidth
      : Number.MAX_SAFE_INTEGER;
    graphemes.settings.y = this.#cursorY = this.y;
    graphemes.settings.x = this.#cursorX = this.x + indexWidth;

    if (this.width >= indexWidth) {
      this.#scrollV();
      this.#scrollH(textWidth);
      this.#renderLines(indexWidth);
    }

    if (this.#focused) {
      vt.cursor.set(vt.buf, this.#cursorY, this.#cursorX);
    }
  }

  setTheme(theme: themes.Theme): void {
    this.#color.bg = new Uint8Array(theme.bgMain);
    this.#color.void = new Uint8Array(theme.bgDark0);
    this.#color.index = new Uint8Array([
      ...theme.bgLight0,
      ...theme.fgDark0,
    ]);
    this.#color.char = {
      [CharColor.Undefined]: new Uint8Array(),
      [CharColor.Visible]: new Uint8Array([
        ...theme.bgMain,
        ...theme.fgLight1,
      ]),
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

  #renderLines(indexWidth: number): void {
    let row = this.y;

    for (let ln = this.#scrollLn;; ln += 1) {
      if (ln < this.doc.lineCount) {
        row = this.#renderLine(indexWidth, ln, row);
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

  #scrollV(): void {
    const deltaLn = this.cursor.ln - this.#scrollLn;

    // Above?
    if (deltaLn <= 0) {
      this.#scrollLn = this.cursor.ln;
      return;
    }

    // Below?

    if (deltaLn > this.height) {
      this.#scrollLn = this.cursor.ln - this.height;
    }

    const xs = std.range(this.#scrollLn, this.cursor.ln + 1).map((ln) =>
      this.gDoc.line(ln)
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

  #scrollH(textWidth: number): void {
    const cell =
      this.gDoc.line(this.cursor.ln, true).drop(this.cursor.col).next().value;
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

    const xs = this.gDoc.line(this.cursor.ln, true)
      .drop(this.cursor.col - deltaCol)
      .take(deltaCol)
      .map((x) => x.gr.width)
      .toArray();

    let width = std.sum(xs);

    for (const w of xs) {
      if (width < textWidth) {
        break;
      }

      this.#scrollCol += 1;
      width -= w;
    }

    this.#cursorX += width;
  }

  #renderLine(indexWidth: number, ln: number, row: number): number {
    let availableWidth = 0;
    let currentColor = CharColor.Undefined;

    const xs = this.gDoc.line(ln);

    for (const { gr: { width, isVisible, bytes }, i, col } of xs) {
      if (col === 0) {
        if (i > 0) {
          row += 1;
          if (row >= this.y + this.height) {
            return row;
          }
        }

        vt.cursor.set(vt.buf, row, this.x);

        if (indexWidth > 0) {
          if (i === 0) {
            vt.buf.write(this.#color.index);
            vt.writeText(
              vt.buf,
              [indexWidth],
              `${ln + 1} `.padStart(indexWidth),
            );
          } else {
            vt.buf.write(this.#color.bg);
            vt.writeSpaces(vt.buf, indexWidth);
          }
        }

        availableWidth = this.width - indexWidth;
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
