import * as kitty from "@lib/kitty";

export abstract class Component<EM = Record<PropertyKey, never>> {
  width = 0;
  height = 0;
  y = 0;
  x = 0;

  protected children: Record<string, Component<unknown>> = {};

  private listeners: {
    [E in keyof EM]?: ((data: EM[E]) => void)[];
  } = {};

  resize(width: number, height: number, y: number, x: number): void {
    this.width = width;
    this.height = height;
    this.y = y;
    this.x = x;

    this.resizeChildren();
  }

  resizeChildren(): void {
  }

  abstract render(): void;

  handleKey(_: kitty.Key): boolean {
    return false;
  }

  on<E extends keyof EM>(name: E, cb: (data: EM[E]) => void): void {
    this.listeners[name] = [...(this.listeners[name] ?? []), cb];
  }

  emit<E extends keyof EM>(name: E, data: EM[E]): void {
    this.listeners[name]?.forEach((cb) => cb(data));
  }
}
