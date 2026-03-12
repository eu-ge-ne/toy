export interface IRoot {
  render: () => void;
  isLayoutDirty: boolean;
  zen: boolean;
  filePath: string;
  isDirty: boolean;
  inputTime: number;
  renderTime: number;
  ln: number;
  col: number;
  lnCount: number;
}
