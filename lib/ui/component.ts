export abstract class Component {
  w = 0;
  h = 0;

  y = 0;
  x = 0;

  constructor(readonly resize: (_: Component, __: Component) => void) {
  }

  abstract render(): void;

  layout(p: Component): void {
    this.resize(this, p);
  }
}
