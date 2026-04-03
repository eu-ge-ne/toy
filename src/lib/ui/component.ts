import * as commands from "@lib/commands";
import * as kitty from "@lib/kitty";

export abstract class Component {
  width = 0;
  height = 0;
  y = 0;
  x = 0;

  protected children: Record<string, Component> = {};

  resize(width: number, height: number, y: number, x: number): void {
    this.width = width;
    this.height = height;
    this.y = y;
    this.x = x;

    this.layout();
  }

  abstract layout(): void;
  abstract render(): void;

  handleKey(_: kitty.Key): boolean {
    return false;
  }

  async handleCommand(_: commands.Command): Promise<void> {
  }
}
