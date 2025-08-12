export function iter_to_str(iter: IteratorObject<string>): string {
  return iter.reduce((a, x) => a + x, "");
}
