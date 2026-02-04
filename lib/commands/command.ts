import { Key } from "@lib/kitty";

export abstract class Command {
  abstract id: string;
  abstract description: string;
  abstract shortcuts: Key[];
}
