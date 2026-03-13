import * as commands from "@lib/commands";
import * as kitty from "@lib/kitty";

export abstract class Unit {
  w = 0;
  h = 0;
  y = 0;
  x = 0;

  resize(w: number, h: number, y: number, x: number): void {
    this.w = w;
    this.h = h;
    this.y = y;
    this.x = x;

    this.layout();
  }

  abstract layout(): void;
  abstract render(): void;
  abstract handleKey(key: kitty.Key): void;
  abstract handleCommand(cmd: commands.Command): Promise<void>;
}
