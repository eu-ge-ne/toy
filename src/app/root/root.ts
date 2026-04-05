export interface IRoot {
  render: () => void;
  isLayoutDirty: boolean;
  filePath: string;
  isDirty: boolean;
  inputTime: number;
}
