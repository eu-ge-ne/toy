import { CSI } from "./ansi.ts";

export interface Writer {
  write(_: Uint8Array): void;
}

export const sync = new class SyncWriter implements Writer {
  static #bsuBytes = CSI("?2026h");
  static #esuBytes = CSI("?2026l");
  #c = 0;

  write(chunk: Uint8Array): void {
    for (let i = 0; i < chunk.length;) {
      i += Deno.stdout.writeSync(chunk.subarray(i));
    }
  }

  bsu(): void {
    if (this.#c === 0) {
      this.write(SyncWriter.#bsuBytes);
    }
    this.#c += 1;
  }

  esu(): void {
    this.#c -= 1;
    if (this.#c === 0) {
      this.write(SyncWriter.#esuBytes);
    }
  }
}();

export const buf = new class BufWriter implements Writer {
  #buf = new ArrayBuffer(1024 * 64, { maxByteLength: 1024 * 1024 * 64 });
  #bytes = new Uint8Array(this.#buf);
  #i = 0;

  write(chunk: Uint8Array): void {
    const j = this.#i + chunk.byteLength;
    if (j > this.#buf.byteLength) {
      this.#buf.resize(j * 2);
    }
    this.#bytes.set(chunk, this.#i);
    this.#i = j;
  }

  flush(): void {
    sync.write(this.#bytes.subarray(0, this.#i));
    this.#i = 0;
  }
}();
