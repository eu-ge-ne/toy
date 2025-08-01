import { Chunks, chunks_length } from "./chunks.ts";
import { space } from "./space.ts";
import { text } from "./text.ts";
import { Span } from "./span.ts";

export function* center(span: Span, ...chunks: Chunks): Generator<Uint8Array> {
  const w0 = Math.trunc((span.len - chunks_length(chunks)) / 2);
  if (w0 > 0) {
    yield space(span, w0);
  }

  yield* text(span, ...chunks);

  if (span.len > 0) {
    yield space(span, span.len);
  }
}
