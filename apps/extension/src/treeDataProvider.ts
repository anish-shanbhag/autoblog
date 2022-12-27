import path from "path";

import * as vscode from "vscode";

interface DiffStatus {
  type: "file";
  path: string;
  status: string;
}

interface DiffTree {
  type: "tree";
  path: string;
  children: {
    [path: string]: DiffTree | DiffStatus;
  };
}

function addToTree(tree: DiffTree, filePath: string, status: string) {
  // console.log(tree);
  const parts = filePath.split(path.sep);
  if (parts.length === 1) {
    // console.log(filePath);
    tree.children[filePath] = {
      type: "file",
      path: filePath,
      status,
    };
    return;
  }
  let current = tree.path;
  while (parts.length > 1) {
    current = path.join(current, parts.shift()!);
    if (current in tree.children) {
      addToTree(
        tree.children[current] as DiffTree,
        parts.join(path.sep),
        status
      );
      return;
    }
  }
  tree.children[path.dirname(filePath)] = {
    type: "tree",
    path: path.dirname(filePath),
    children: {
      [path.basename(filePath)]: {
        type: "file",
        path: path.basename(filePath),
        status,
      },
    },
  };
}

class FileItem extends vscode.TreeItem {
  constructor(public readonly diffItem: DiffTree | DiffStatus) {
    const label = diffItem.path.split(path.sep).join(` ${path.sep} `);
    const collapsibleState =
      diffItem.type === "tree"
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None;
    super(label, collapsibleState);
    this.diffItem = diffItem;
    this.tooltip = label;
    if (diffItem.type === "file") {
      this.iconPath = vscode.ThemeIcon.File;
      this.resourceUri = vscode.Uri.file(diffItem.path);
    }
  }
}

export class DiffTreeProvider implements vscode.TreeDataProvider<FileItem> {
  diffTree: DiffTree;
  private _onDidChangeTreeData: vscode.EventEmitter<
    FileItem | undefined | null | void
  > = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    FileItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(workspaceRoot: string, initialFiles: string[]) {
    this.diffTree = {
      type: "tree",
      path: "",
      children: {},
    };
    // console.log("starting");
    // console.log(this.diffTree);
    for (const filePath of initialFiles) {
      // console.log({ ...this.diffTree.children });
      addToTree(this.diffTree, filePath, "M");
    }
  }

  getTreeItem(item: FileItem) {
    return item;
  }

  async getChildren(fileItem?: FileItem) {
    const diffItem = fileItem?.diffItem ?? this.diffTree;
    if (diffItem.type === "file") {
      return [];
    }
    return Object.values(diffItem.children).map(
      (childItem) => new FileItem(childItem)
    );
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
