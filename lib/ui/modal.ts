import { Area } from "./area.ts";
import { Control } from "./control.ts";

// deno-lint-ignore no-explicit-any
export abstract class Modal<P extends any[], R> extends Control {
  protected abstract size: Area;

  abstract open(...params: P): Promise<R>;

  override resize(area: Area): void {
    this.area = area.center(this.size);
  }
}
