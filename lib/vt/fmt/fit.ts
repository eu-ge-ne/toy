import { Chunks } from "./chunks.ts";
import { Span } from "./span.ts";
import { text } from "./text.ts";

export function* fit(span: Span, ...chunks: Chunks): Generator<Uint8Array> {
  for (let chunk of chunks) {
    if (typeof chunk !== "string") {
      yield chunk;
      continue;
    }

    if (span.len === 0) {
      break;
    }

    if (chunk.length > span.len) {
      chunk = chunk.slice(0, span.len);
    }

    yield text(chunk);

    span.len -= chunk.length;
  }
}
