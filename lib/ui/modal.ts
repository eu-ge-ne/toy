import { Control } from "./control.ts";

export abstract class Modal<P extends unknown[], R> extends Control {
  abstract open(...params: P): Promise<R>;
}
