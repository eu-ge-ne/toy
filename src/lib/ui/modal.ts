import { Widget } from "./widget.ts";

export abstract class Modal<T = unknown> extends Widget<T> {
  abstract open(): void;
}
