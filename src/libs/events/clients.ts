import { Events } from "./events.ts";
import { Signals } from "./signals.ts";

export class Clients<EE extends Events, NN extends Signals> {
  Interceptors: {
    [E in keyof EE]?: { fn: EE[E]; order: number }[];
  } = {};

  Reactors: {
    [N in keyof NN]?: { fn: NN[N]; order: number }[];
  } = {};
}
