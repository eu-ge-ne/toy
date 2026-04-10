import { Widget } from "./widget.ts";

export abstract class Frame<E = unknown> extends Widget<E> {
  abstract render(): void;
}
