import { Chunks, chunks_length } from "./chunks.ts";
import { space } from "./space.ts";
import { text } from "./text.ts";
import { Span } from "./span.ts";

export function* lpad(
  span: Span,
  pad: number,
  ...chunks: Chunks
): Generator<Uint8Array> {
  const len = chunks_length(chunks);

  if (len < pad) {
    yield space(span, pad - len);
  }

  yield* text(span, ...chunks);
}
