export abstract class Widget<T> {
  width = 0;
  height = 0;
  y = 0;
  x = 0;

  protected children: Record<string, Widget<unknown>> = {};

  private listeners: {
    [K in keyof T]?: ((data: T[K]) => void)[];
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

  on<K extends keyof T>(name: K, cb: (data: T[K]) => void): void {
    this.listeners[name] = [...(this.listeners[name] ?? []), cb];
  }

  emit<K extends keyof T>(name: K, data: T[K]): void {
    this.listeners[name]?.forEach((cb) => cb(data));
  }
}
