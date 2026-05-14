// deno-lint-ignore no-explicit-any
type _SignalData = any[];

export type Signals = {
  [key: string]: (...data: _SignalData) => void | Promise<void>;
};
