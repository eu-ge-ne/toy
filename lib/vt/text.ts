import { Writer } from "./writer.ts";

const encoder = new TextEncoder();

export function write_spaces(out: Writer, n: number): void {
  // TODO
  out.write(encoder.encode(` \x1b[${n - 1}b`));
}

export function write_text(
  out: Writer,
  span: [number],
  ...xs: (string | Uint8Array)[]
): void {
  for (let chunk of xs) {
    if (typeof chunk !== "string") {
      out.write(chunk);
      continue;
    }

    if (span[0] === 0) {
      break;
    }

    if (chunk.length > span[0]) {
      chunk = chunk.slice(0, span[0]);
    }

    out.write(encoder.encode(chunk));

    span[0] -= chunk.length;
  }
}

export function write_text_center(
  out: Writer,
  span: [number],
  ...xs: (string | Uint8Array)[]
): void {
  const len = xs.filter((x) => typeof x === "string").reduce(
    (a, x) => a + x.length,
    0,
  );
  const w0 = Math.trunc((span[0] - len) / 2);
  if (w0 > 0) {
    span[0] -= w0;
    write_spaces(out, w0);
  }

  for (let chunk of xs) {
    if (typeof chunk !== "string") {
      out.write(chunk);
      continue;
    }

    if (span[0] === 0) {
      break;
    }

    if (chunk.length > span[0]) {
      chunk = chunk.slice(0, span[0]);
    }

    out.write(encoder.encode(chunk));

    span[0] -= chunk.length;
  }

  const w1 = span[0];
  if (w1) {
    span[0] = 0;
    write_spaces(out, w1);
  }
}
