const buf = new Uint8Array(1024 * 1024 * 2);

let pos = 0;

function commit(): void {
  for (let i = 0; i < pos;) {
    i += Deno.stdout.writeSync(buf.subarray(i, pos));
  }

  pos = 0;
}

export function write(...chunks: Uint8Array[]): void {
  for (const chunk of chunks) {
    buf.set(chunk, pos);

    pos += chunk.length;
  }
}

export function flush(...chunks: Uint8Array[]): void {
  write(...chunks);

  commit();
}
