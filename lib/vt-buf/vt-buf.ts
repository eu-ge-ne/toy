export class VtBuf {
  #buf = new ArrayBuffer(1024 * 64, { maxByteLength: 1024 * 1024 * 64 });
  #bytes = new Uint8Array(this.#buf);
  #i = 0;

  write(...chunks: Uint8Array[]): void {
    for (const chunk of chunks) {
      const j = this.#i + chunk.byteLength;

      if (j > this.#buf.byteLength) {
        this.#buf.resize(j * 2);
      }

      this.#bytes.set(chunk, this.#i);

      this.#i = j;
    }
  }

  flush(...chunks: Uint8Array[]): void {
    this.write(...chunks);

    for (let j = 0; j < this.#i;) {
      j += Deno.stdout.writeSync(this.#bytes.subarray(j, this.#i));
    }

    this.#i = 0;
  }
}
