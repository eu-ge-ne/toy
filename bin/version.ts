import deno from "../deno.json" with { type: "json" };

const v = `toy ${deno.version} (deno ${Deno.version.deno})`;

Deno.stdout.write(new TextEncoder().encode(v));
