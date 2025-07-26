import { Action } from "../action.ts";

export class SaveAction extends Action {
  keys = [
    { name: "F2" },
  ];

  protected override async _run(): Promise<void> {
    await this.app.save();
  }
}
