import { colordx } from "@colordx/core";

const res = await fetch(
  "https://raw.githubusercontent.com/tailwindlabs/tailwindcss/refs/tags/v4.2.2/packages/tailwindcss/theme.css",
);
const body = await res.text();

const matches = body.matchAll(/--color-(.+)-(\d+): (oklch\(.+\));/g);

const colors = Object.fromEntries(
  matches.map((
    [, color, index, oklch],
  ) => {
    const { r, g, b, alpha } = colordx(oklch!).toRgb();
    if (alpha !== 1) {
      throw new Error("unexpected");
    }
    return [color! + index!, [r, g, b]];
  }),
);

Deno.writeTextFileSync("./colors.json", JSON.stringify(colors, null, 4));
