import { cuf, ech } from "@eu-ge-ne/ctlseqs";

export function* space(len: number): Generator<Uint8Array> {
  yield ech(len);
  yield cuf(len);
}
