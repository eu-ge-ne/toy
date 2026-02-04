import { Key } from "@lib/kitty";

export interface Command {
  id: string;
  description: string;
  shortcuts: Key[];
}
