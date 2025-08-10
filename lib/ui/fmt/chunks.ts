export type Chunks = (string | Uint8Array)[];

export function chunks_length(chunks: Chunks): number {
  return chunks.filter((x) => typeof x === "string").reduce(
    (a, x) => a + x.length,
    0,
  );
}
