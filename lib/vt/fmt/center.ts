import { Chunks, chunks_length } from "./chunks.ts";
import { fit } from "./fit.ts";
import { space } from "./space.ts";
import { Span } from "./span.ts";

export function* center(span: Span, ...chunks: Chunks): Generator<Uint8Array> {
  const w0 = Math.trunc((span.len - chunks_length(chunks)) / 2);
  if (w0 > 0) {
    span.len -= w0;
    yield* space(w0);
  }

  yield* fit(span, ...chunks);

  const w1 = span.len;
  if (w1) {
    span.len = 0;
    yield* space(w1);
  }
}
