import * as graphemes from "@lib/graphemes";
import { range, sum } from "@lib/std";
import * as textBuf from "@lib/text-buf";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

import { Cursor } from "./cursor.ts";
import { TextLayout } from "./text-layout.ts";

interface TextEditorProps {
  disabled: boolean; // TODO: rename to `focused`
  index: boolean;
  whitespace: boolean;
  wrap: boolean;
  textBuf: textBuf.TextBuf;
  textLayout: TextLayout;
  cursor: Cursor;
  color: {
    bg: Uint8Array;
    void: Uint8Array;
    index: Uint8Array;
    char: Record<CharColor, Uint8Array>;
  };
}

export const enum CharColor {
  Undefined,
  Visible,
  Whitespace,
  Empty,
  VisibleSelected,
  WhitespaceSelected,
  EmptySelected,
}

export class TextEditor extends ui.Frame {
  private index_width = 0;
  private text_width = 0;
  private scroll_ln = 0;
  private scroll_col = 0;
  private cursor_y = 0;
  private cursor_x = 0;

  constructor(readonly props: TextEditorProps) {
    super();
  }

  render(): void {
    if (this.props.index && (this.props.textBuf.lineCount > 0)) {
      this.index_width = Math.trunc(Math.log10(this.props.textBuf.lineCount)) +
        3;
    } else {
      this.index_width = 0;
    }

    this.text_width = this.width - this.index_width;
    graphemes.segmenter.settings.width = this.props.wrap
      ? this.text_width
      : Number.MAX_SAFE_INTEGER;

    graphemes.segmenter.settings.y = this.cursor_y = this.y;
    graphemes.segmenter.settings.x = this.cursor_x = this.x + this.index_width;

    if (this.width >= this.index_width) {
      this.#renderLines();
    }

    if (!this.props.disabled) {
      vt.cursor.set(vt.buf, this.cursor_y, this.cursor_x);
    }
  }

  #renderLines(): void {
    this.#scrollV();
    this.#scrollH();

    let row = this.y;

    for (let ln = this.scroll_ln;; ln += 1) {
      if (ln < this.props.textBuf.lineCount) {
        row = this.#renderLine(ln, row);
      } else {
        vt.cursor.set(vt.buf, row, this.x);
        vt.buf.write(this.props.color.void);
        vt.clear_line(vt.buf, this.width);
      }

      row += 1;
      if (row >= this.y + this.height) {
        break;
      }
    }
  }

  #scrollV(): void {
    const delta_ln = this.props.cursor.ln - this.scroll_ln;

    // Above?
    if (delta_ln <= 0) {
      this.scroll_ln = this.props.cursor.ln;
      return;
    }

    // Below?

    if (delta_ln > this.height) {
      this.scroll_ln = this.props.cursor.ln - this.height;
    }

    const xs = range(this.scroll_ln, this.props.cursor.ln + 1).map((ln) =>
      this.props.textLayout.line(ln)
        .reduce((a, { i, col }) => a + (i > 0 && col === 0 ? 1 : 0), 1)
    );

    let i = 0;
    let height = sum(xs);

    while (height > this.height) {
      height -= xs[i]!;
      this.scroll_ln += 1;
      i += 1;
    }

    while (i < xs.length - 1) {
      this.cursor_y += xs[i]!;
      i += 1;
    }
  }

  #scrollH(): void {
    const cell = this.props.textLayout.line(this.props.cursor.ln, true).drop(
      this.props.cursor.col,
    ).next()
      .value;
    if (cell) {
      this.cursor_y += cell.ln;
    }

    const col = cell?.col ?? 0; // col = f(cursor.col)
    const delta_col = col - this.scroll_col;

    // Before?
    if (delta_col <= 0) {
      this.scroll_col = col;
      return;
    }

    // After?

    const xs = this.props.textLayout.line(this.props.cursor.ln, true)
      .drop(this.props.cursor.col - delta_col)
      .take(delta_col)
      .map((x) => x.gr.width)
      .toArray();

    let width = sum(xs);

    for (const w of xs) {
      if (width < this.text_width) {
        break;
      }

      this.scroll_col += 1;
      width -= w;
    }

    this.cursor_x += width;
  }

  #renderLine(ln: number, row: number): number {
    let available_w = 0;
    let current_color = CharColor.Undefined;

    const xs = this.props.textLayout.line(ln);

    for (const { gr: { width, isVisible, bytes }, i, col } of xs) {
      if (col === 0) {
        if (i > 0) {
          row += 1;
          if (row >= this.y + this.height) {
            return row;
          }
        }

        vt.cursor.set(vt.buf, row, this.x);

        if (this.index_width > 0) {
          if (i === 0) {
            vt.buf.write(this.props.color.index);
            vt.write_text(
              vt.buf,
              [this.index_width],
              `${ln + 1} `.padStart(this.index_width),
            );
          } else {
            vt.buf.write(this.props.color.bg);
            vt.write_spaces(vt.buf, this.index_width);
          }
        }

        available_w = this.width - this.index_width;
      }

      if ((col < this.scroll_col) || (width > available_w)) {
        continue;
      }

      const color = charColor(
        this.props.cursor.isSelected(ln, i),
        isVisible,
        this.props.whitespace,
      );

      if (color !== current_color) {
        current_color = color;
        vt.buf.write(this.props.color.char[color]);
      }

      vt.buf.write(bytes);

      available_w -= width;
    }

    return row;
  }
}

function charColor(
  is_selected: boolean,
  is_visible: boolean,
  whitespace_enabled: boolean,
): CharColor {
  if (is_selected) {
    if (is_visible) {
      return CharColor.VisibleSelected;
    } else if (whitespace_enabled) {
      return CharColor.WhitespaceSelected;
    } else {
      return CharColor.EmptySelected;
    }
  } else {
    if (is_visible) {
      return CharColor.Visible;
    } else if (whitespace_enabled) {
      return CharColor.Whitespace;
    } else {
      return CharColor.Empty;
    }
  }
}
