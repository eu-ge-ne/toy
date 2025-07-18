import { Chunks, chunks_length } from "./chunks.ts";
import { fmt_space } from "./space.ts";
import { fmt_text } from "./text.ts";
import { Span } from "./span.ts";

export function* fmt_lpad(
  span: Span,
  pad: number,
  ...chunks: Chunks
): Generator<Uint8Array> {
  const len = chunks_length(chunks);

  if (len < pad) {
    yield fmt_space(span, pad - len);
  }

  yield* fmt_text(span, ...chunks);
}
