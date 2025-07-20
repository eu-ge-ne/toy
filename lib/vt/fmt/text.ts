import { Chunks } from "./chunks.ts";
import { Span } from "./span.ts";

const encoder = new TextEncoder();

export function* text(span: Span, ...chunks: Chunks): Generator<Uint8Array> {
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

    yield encoder.encode(chunk);

    span.len -= chunk.length;
  }
}
