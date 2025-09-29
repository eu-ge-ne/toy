import { sync } from "./sync.ts";
import { Writer } from "./writer.ts";

class BufOut implements Writer {
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
}

export const buf = new BufOut();
