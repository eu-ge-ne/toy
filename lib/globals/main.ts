export interface Globals {
  renderTree: () => void;
  isLayoutDirty: boolean;

  filePath: string;
  isDirty: boolean;
  zen: boolean;
  inputTime: number;
  renderTime: number;
  ln: number;
  col: number;
  lnCount: number;
}
