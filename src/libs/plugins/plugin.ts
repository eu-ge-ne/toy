import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";

import { Host } from "./host.ts";

export interface DebugData {
  version?: string;
  renderElapsed?: number;
  inputElapsed?: number;
}

export interface StatusData {
  doc?: {
    fileName?: string;
    content?: {
      modified: boolean;
      lineCount: number;
    };
    cursor?: {
      ln: number;
      col: number;
    };
  };
}

export abstract class Plugin {
  constructor(protected readonly host: Host) {
  }

  async onKey?(_: kitty.Key): Promise<boolean>;
  async onCommand?(_: commands.Command): Promise<boolean>;

  onDebug?(_: DebugData): void;
  onStatus?(_: StatusData): void;
}
