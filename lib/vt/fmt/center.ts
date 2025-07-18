import { Chunks, chunks_length } from "./chunks.ts";
import { fmt_space } from "./space.ts";
import { fmt_text } from "./text.ts";
import { Span } from "./span.ts";

export function* fmt_center(
  span: Span,
  ...chunks: Chunks
): Generator<Uint8Array> {
  const w0 = Math.trunc((span.len - chunks_length(chunks)) / 2);
  if (w0 > 0) {
    yield fmt_space(span, w0);
  }

  yield* fmt_text(span, ...chunks);

  if (span.len > 0) {
    yield fmt_space(span, span.len);
  }
}
