// deno-lint-ignore no-explicit-any
export type InterceptorEventData<T = Record<string, any>> =
  & { cancel?: boolean }
  & T;

export type InterceptorEventDataBase =
  & { cancel?: boolean }
  // deno-lint-ignore no-explicit-any
  & Record<string, any>;

// deno-lint-ignore no-explicit-any
export type ReactorEventData<T = any> = T;
