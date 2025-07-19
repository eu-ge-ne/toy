import { Buf } from "@lib/buf";
import { Grapheme, GraphemeSegmenter } from "@lib/grapheme";
import { Key } from "@lib/input";
import { Area, Pane } from "@lib/ui";
import * as vt from "@lib/vt";
import { VT_WIDTH_COLORS } from "@ui/theme";

import * as key from "./key/mod.ts";
import { Cursor } from "./cursor.ts";
import { History } from "./history.ts";
import { Render } from "./render.ts";
import { Scroll } from "./scroll.ts";

const LN_INDEX_WIDTH = 1 + 6 + 1;

interface EditorOptions {
  multi_line: boolean;
  show_ln_index: boolean;
}

export class Editor extends Pane {
  on_react?: (_: number) => void;
  on_render?: (_: number) => void;
  on_cursor?: (_: { ln: number; col: number; ln_count: number }) => void;
  on_change?: (_: boolean) => void;

  readonly cursor = new Cursor(this);
  readonly scroll = new Scroll(this);
  readonly history = new History(this);
  #render = new Render(this);

  #handlers: key.KeyHandler[] = [
    new key.Left(this),
    new key.Right(this),
    new key.Home(this),
    new key.End(this),
    new key.Up(this),
    new key.Down(this),
    new key.PageUp(this),
    new key.PageDown(this),
    new key.Top(this),
    new key.Bottom(this),

    new key.SelectAll(this),
    new key.Copy(this),
    new key.Cut(this),
    new key.Paste(this),

    new key.Undo(this),
    new key.Redo(this),

    new key.Enter(this),
    new key.Tab(this),
    new key.Backspace(this),
    new key.Delete(this),
    new key.Center(this),
  ];

  ln_index_width = 0;

  invisible_enabled = false;
  wrap_enabled = false;
  wrap_width = Number.MAX_SAFE_INTEGER;

  clipboard = "";

  constructor(
    readonly segmenter: GraphemeSegmenter,
    readonly buf: Buf,
    readonly opts: EditorOptions,
  ) {
    super();

    this.ln_index_width = opts.show_ln_index ? LN_INDEX_WIDTH : 0;
  }

  override resize(area: Area): void {
    super.resize(area);

    this.wrap_width = this.wrap_enabled
      ? this.area.w - this.ln_index_width
      : Number.MAX_SAFE_INTEGER;
  }

  render(): void {
    const started = Date.now();

    this.scroll.scroll();
    this.#render.render();
    this.on_cursor?.({ ...this.cursor, ln_count: this.buf.ln_count });

    this.on_render?.(Date.now() - started);
  }

  reset(): void {
    if (this.opts.multi_line) {
      this.cursor.move(
        -Number.MAX_SAFE_INTEGER,
        -Number.MAX_SAFE_INTEGER,
        false,
      );
    } else {
      this.cursor.move(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, false);
    }

    this.history.reset();
  }

  on_key(key: Key | string): void {
    if (!this.enabled) {
      return;
    }

    const started = Date.now();

    try {
      if (typeof key === "string") {
        this.insert(key);
        this.render();
        return;
      }

      if (typeof key.text === "string") {
        this.insert(key.text);
        this.render();
        return;
      }

      const handler = this.#handlers.find((x) => x.match(key));
      if (handler) {
        handler.handle(key);
        this.render();
      }
    } finally {
      this.on_react?.(Date.now() - started);
    }
  }

  line(ln: number): IteratorObject<Grapheme> {
    const { buf, segmenter } = this;

    return segmenter.graphemes(buf.line(ln));
  }

  *fold_line(
    ln: number,
    width: number,
  ): Generator<
    { g: Grapheme; i: number; l: number; c: number }
  > {
    const { buf, segmenter } = this;

    let i = 0;
    let w = 0;
    let l = 0;
    let c = 0;

    for (const g of segmenter.graphemes(buf.line(ln))) {
      if (g.width < 0) {
        vt.end_write();
        g.width = vt.width(VT_WIDTH_COLORS, g.bytes);
        vt.begin_write();
      }

      yield { g, i, l, c };

      i += 1;
      c += 1;
      w += g.width;

      if (w >= width) {
        w = 0;
        l += 1;
        c = 0;
      }
    }
  }

  insert(text: string): void {
    const { cursor, buf, history, segmenter } = this;

    if (cursor.selecting) {
      buf.delete(cursor.from, cursor.to);
      cursor.set(...cursor.from, false);
    }

    buf.insert([cursor.ln, cursor.col], text);

    const [ln, col] = segmenter.measure(text);
    if (ln === 0) {
      cursor.move(0, col, false);
    } else {
      cursor.set(cursor.ln + ln, col, false);
    }

    history.push();
  }

  backspace(): void {
    const { cursor, buf, history, segmenter } = this;

    if (cursor.ln > 0 && cursor.col === 0) {
      const char_count = segmenter.count_graphemes(buf.line(cursor.ln));

      switch (char_count) {
        case 1: {
          buf.delete([cursor.ln, cursor.col], [cursor.ln, cursor.col]);

          cursor.move(-1, Number.MAX_SAFE_INTEGER, false);

          break;
        }
        default: {
          cursor.move(-1, Number.MAX_SAFE_INTEGER, false);

          buf.delete([cursor.ln, cursor.col], [cursor.ln, cursor.col]);
        }
      }
    } else {
      buf.delete([cursor.ln, cursor.col - 1], [cursor.ln, cursor.col - 1]);

      cursor.move(0, -1, false);
    }

    history.push();
  }

  delete_char(): void {
    const { cursor, buf, history } = this;

    buf.delete([cursor.ln, cursor.col], [cursor.ln, cursor.col]);

    history.push();
  }

  delete_selection(): void {
    const { cursor, buf, history } = this;

    buf.delete(cursor.from, cursor.to);
    cursor.set(...cursor.from, false);

    history.push();
  }

  toggle_invisible(): void {
    this.invisible_enabled = !this.invisible_enabled;
  }

  toggle_wrap(): void {
    this.wrap_enabled = !this.wrap_enabled;

    this.cursor.move(0, -Number.MAX_SAFE_INTEGER, false);
  }
}
