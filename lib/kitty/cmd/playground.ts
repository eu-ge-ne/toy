import { Key, query_flags, set_flags } from "../main.ts";

Deno.stdin.setRaw(true);

write(
  set_flags({
    disambiguate: true,
    events: true,
    alternates: true,
    all_keys: true,
    text: true,
  }),
);

write(query_flags);

self.onunload = () => {
  write(set_flags({}));
  console.log("\nExit.");
};

const buf = new Uint8Array(1024);

let j = 0;

while (true) {
  const bytes_read = await Deno.stdin.read(buf);
  if (bytes_read === null) {
    continue;
  }
  const bytes = buf.subarray(0, bytes_read);

  for (let i = 0; i < bytes.length;) {
    const result = Key.parse(bytes.subarray(i));

    if (!result) {
      let next_esc_i = bytes.indexOf(0x1b, i + 1);
      if (next_esc_i < 0) {
        next_esc_i = bytes.length;
      }

      console.table({ j, bytes: bytes.subarray(i, next_esc_i) });
      j += 1;
      i = next_esc_i;

      continue;
    }

    const [key, bytes_parsed] = result;

    const raw = new TextDecoder().decode(bytes.subarray(0, bytes_parsed));
    console.table({ j, ...key, raw });

    if (key.name === "c" && key.ctrl) {
      Deno.exit();
    }

    j += 1;
    i += bytes_parsed;
  }
}

function write(bytes: Uint8Array): void {
  let x = 0;
  while (x < bytes.length) {
    x += Deno.stdout.writeSync(bytes.subarray(x));
  }
}
