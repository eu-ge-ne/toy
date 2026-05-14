export abstract class ConfirmModal {
  abstract open(_: string): Promise<boolean>;
}
