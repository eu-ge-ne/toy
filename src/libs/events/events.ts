// deno-lint-ignore no-explicit-any
export type EventData<T = Record<string, any>> = { cancel?: boolean } & T;

// deno-lint-ignore no-explicit-any
type _EventData = any;

export type Events = {
  [key: string]: (data: _EventData) => Promise<void>;
};
