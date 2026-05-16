import deno from "../../../deno.json" with { type: "json" };

export const version = `toy ${deno.version} (deno ${Deno.version.deno})`;
