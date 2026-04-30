import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";

const encoder = new TextEncoder();

interface ListWidgetItem<T> {
  value: T;
  string(width: number): string;
}

interface Props {
  readonly emptyText: string;
}

export class ListWidget<T> extends widgets.Frame<Props> {
  color = new Uint8Array();
  selectedColor = new Uint8Array();
  values: ListWidgetItem<T>[] = [];
  selectedIndex = 0;

  #scrollIndex = 0;

  render(): void {
    if (this.values.length === 0) {
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
    const delta = this.selectedIndex - this.#scrollIndex;
    if (delta < 0) {
      this.#scrollIndex = this.selectedIndex;
    } else if (delta >= this.height) {
      this.#scrollIndex = this.selectedIndex - this.height + 1;
    }
  }

  #renderList(): void {
    for (let y = 0; y < this.height; y += 1) {
      const i = this.#scrollIndex + y;
      const v = this.values[i];
      if (!v) {
        break;
      }

      vt.buf.write(i === this.selectedIndex ? this.selectedColor : this.color);
      vt.cursor.set(vt.buf, this.y + y, this.x);
      vt.buf.write(encoder.encode(v.string(this.width)));
    }
  }
}
