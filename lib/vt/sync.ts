import { CSI } from "./ansi.ts";
import { Writer } from "./writer.ts";

const bsu_bytes = CSI("?2026h");
const esu_bytes = CSI("?2026l");

class SyncOut implements Writer {
  #c = 0;

  write(chunk: Uint8Array): void {
    for (let i = 0; i < chunk.length;) {
      i += Deno.stdout.writeSync(chunk.subarray(i));
    }
  }

  bsu(): void {
    if (this.#c === 0) {
      this.write(bsu_bytes);
    }

    this.#c += 1;
  }

  esu(): void {
    this.#c -= 1;

    if (this.#c === 0) {
      this.write(esu_bytes);
    }
  }
}

export const sync = new SyncOut();
