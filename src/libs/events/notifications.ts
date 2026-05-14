// deno-lint-ignore no-explicit-any
type _NotificationData = any[];

export type Notifications = {
  [key: string]: (...data: _NotificationData) => void | Promise<void>;
};
