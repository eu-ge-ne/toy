import { Widget } from "./widget.ts";

export abstract class Modal<E = unknown, P extends unknown[] = []>
  extends Widget<E> {
  abstract open(..._: P): void;
}
