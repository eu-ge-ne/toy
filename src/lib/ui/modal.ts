import { Widget } from "./widget.ts";

export abstract class Modal<E = unknown, P extends unknown[] = [], R = void>
  extends Widget<E> {
  abstract open(..._: P): Promise<R>;
}
