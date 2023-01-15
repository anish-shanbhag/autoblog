// Various interfaces and definitions used for the explorer state
// used by both the extension and the webview

export interface File {
  type: "file";
  path: string;
  status: FileStatus;
}

export interface FileTree {
  type: "tree";
  path: string;
  children: string[];
  populated: boolean;
  expanded: boolean;
  status: FileStatus;
}

export type FileItem = File | FileTree;

export enum FileStatus {
  None = "",
  Added = "A",
  Modified = "M",
  Deleted = "D",
  // Used to mark a parent FileTree which isn't deleted but still
  // has has a deleted child
  HasDeletedChild = "H",
  // Indicates when a file should be removed from the tree completely
  // instead of just being marked as deleted
  RemovedFromTree = "X",
}

export type FileTreeMap = Record<string, FileItem>;

export const emptyFileTreeMap: FileTreeMap = {
  "": {
    type: "tree",
    path: "",
    children: [],
    populated: false,
    expanded: true,
    status: FileStatus.None,
  },
};
