import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";

const encoder = new TextEncoder();

interface ListWidgetItem<T> {
  value: T;
  string(width: number): string;
}

interface Props<T> {
  readonly emptyText: string;
  items: ListWidgetItem<T>[];
  index: number;
}

export class ListWidget<T> extends widgets.Frame<Props<T>> {
  color = new Uint8Array();
  selectedColor = new Uint8Array();

  #scrollIndex = 0;

  render(): void {
    if (this.props.items.length === 0) {
      this.#renderEmpty();
    } else {
      this.#scroll();
      this.#renderList();
    }
  }

  #renderEmpty(): void {
    vt.buf.write(this.color);
    vt.cursor.set(vt.buf, this.y, this.x);
    vt.buf.write(encoder.encode(this.props.emptyText.slice(0, this.width)));
  }

  #scroll(): void {
    const { index } = this.props;

    const delta = index - this.#scrollIndex;
    if (delta < 0) {
      this.#scrollIndex = index;
    } else if (delta >= this.height) {
      this.#scrollIndex = index - this.height + 1;
    }
  }

  #renderList(): void {
    const { items, index } = this.props;

    for (let y = 0; y < this.height; y += 1) {
      const i = this.#scrollIndex + y;
      const v = items[i];
      if (!v) {
        break;
      }

      vt.buf.write(i === index ? this.selectedColor : this.color);
      vt.cursor.set(vt.buf, this.y + y, this.x);
      vt.buf.write(encoder.encode(v.string(this.width)));
    }
  }
}
