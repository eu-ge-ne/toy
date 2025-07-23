export class VtBuf {
  #buf = new Uint8Array(1024 * 1024);
  #pos = 0;

  write(...chunks: Uint8Array[]): void {
    for (const chunk of chunks) {
      if (this.#pos + chunk.length >= this.#buf.length) {
        this.#commit();
      }

      this.#buf.set(chunk, this.#pos);

      this.#pos += chunk.length;
    }
  }

  flush(...chunks: Uint8Array[]): void {
    this.write(...chunks);

    this.#commit();
  }

  #commit(): void {
    for (let i = 0; i < this.#pos;) {
      i += Deno.stdout.writeSync(this.#buf.subarray(i, this.#pos));
    }

    this.#pos = 0;
  }
}
