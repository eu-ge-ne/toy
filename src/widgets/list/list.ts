import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";

const encoder = new TextEncoder();

interface Item<T> {
  label(width: number): string;
  value: T;
}

export class ListWidget<T> extends widgets.Widget<{ emptyText: string }> {
  color = new Uint8Array();
  selectedColor = new Uint8Array();
  items: Item<T>[] = [];
  index = 0;

  #scrollIndex = 0;

  render(): void {
    if (this.items.length === 0) {
      this.#renderEmpty();
    } else {
      this.#scroll();
      this.#renderList();
    }
  }

  #renderEmpty(): void {
    vt.buf.write(this.color);
    vt.cursor.set(vt.buf, this.y, this.x);
    vt.buf.write(encoder.encode(this.params.emptyText.slice(0, this.width)));
  }

  #scroll(): void {
    const { index } = this;

    const delta = index - this.#scrollIndex;
    if (delta < 0) {
      this.#scrollIndex = index;
    } else if (delta >= this.height) {
      this.#scrollIndex = index - this.height + 1;
    }
  }

  #renderList(): void {
    const { items, index } = this;

    for (let y = 0; y < this.height; y += 1) {
      const i = this.#scrollIndex + y;
      const v = items[i];
      if (!v) {
        break;
      }

      vt.buf.write(i === index ? this.selectedColor : this.color);
      vt.cursor.set(vt.buf, this.y + y, this.x);
      vt.buf.write(encoder.encode(v.label(this.width)));
    }
  }
}
