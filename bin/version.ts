import deno from "../deno.json" with { type: "json" };

Deno.stdout.write(new TextEncoder().encode(deno.version));
