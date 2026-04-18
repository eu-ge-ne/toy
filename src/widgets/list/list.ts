import * as vt from "@lib/vt";
import * as widgets from "@lib/widgets";

const encoder = new TextEncoder();

interface ListItem<T> {
  value: T;
  string(width: number): string;
}

interface ListParams {
  readonly emptyText: string;
}

export class List<T> extends widgets.Frame {
  color = new Uint8Array();
  selectedColor = new Uint8Array();
  values: ListItem<T>[] = [];
  selectedIndex = 0;

  #scrollIndex = 0;

  constructor(private readonly params: ListParams) {
    super();
  }

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
    vt.buf.write(encoder.encode(this.params.emptyText.slice(0, this.width)));
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
