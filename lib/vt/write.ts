export function direct_write(...chunks: Uint8Array[]): void {
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length;) {
      i += Deno.stdout.writeSync(chunk.subarray(i));
    }
  }
}
