import { Events } from "./events.ts";
import { Notifications } from "./notifications.ts";

export class Clients<EE extends Events, NN extends Notifications> {
  Interceptors: {
    [E in keyof EE]?: { fn: EE[E]; order: number }[];
  } = {};

  Reactors: {
    [N in keyof NN]?: { fn: NN[N]; order: number }[];
  } = {};
}
