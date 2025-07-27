import { Area } from "./area.ts";
import { Control } from "./control.ts";

export abstract class Modal<P extends unknown[], R> extends Control {
  protected abstract size: Area;
  protected done!: PromiseWithResolvers<R>;

  constructor(protected parent: Control) {
    super();
  }

  abstract open(...params: P): Promise<R>;

  override resize(area: Area): void {
    this.area = area.center(this.size);
  }
}
