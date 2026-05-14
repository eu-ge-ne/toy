export abstract class AlertModal {
  abstract open(_: string): Promise<void>;
}
