export enum DiffStatus {
  None = "",
  Added = "A",
  Modified = "M",
  Deleted = "D",
  Renamed = "R",
}

export interface DiffFile {
  type: "file";
  path: string;
  status: DiffStatus;
}

export interface DiffTree {
  type: "tree";
  path: string;
  children: string[];
  populated: boolean;
  expanded: boolean;
  status: DiffStatus;
}

export type DiffItem = DiffFile | DiffTree;
export type DiffTreeMap = Record<string, DiffItem>;
