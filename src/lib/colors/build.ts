import { colordx } from "@colordx/core";

const res = await fetch(
  "https://raw.githubusercontent.com/tailwindlabs/tailwindcss/refs/tags/v4.2.2/packages/tailwindcss/theme.css",
);
const body = await res.text();

const matches = body.matchAll(/--color-(.+)-(\d+): (oklch\(.+\));/g);

const colors = Object.fromEntries(
  matches.map((
    [, color, index, oklch],
  ) => [color! + index!, colordx(oklch!).toHex()]),
);

Deno.writeTextFileSync("./colors.json", JSON.stringify(colors, null, 4));
