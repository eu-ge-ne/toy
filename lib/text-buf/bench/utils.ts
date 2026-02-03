export function str(n: number): string {
  let str = "";
  while (str.length < n) {
    str += crypto.randomUUID().slice(0, n - str.length);
  }
  return str;
}

export function lines(n: number): string {
  let lines = "";
  for (let i = 0; i < n; i += 1) {
    lines += i.toString() + "\n";
  }
  return lines;
}

const EOL_RE = /\r?\n/gm;

export function read_line(buf: string, index: number): string {
  const matches = Array.from(buf.matchAll(EOL_RE));

  const line_breaks = matches.map((x) => x.index + x[0].length);

  if (index === 0) {
    return buf.slice(0, line_breaks[0]);
  } else {
    return buf.slice(line_breaks[index - 1], line_breaks[index]);
  }
}
