import { DiffStatus, DiffTree, DiffTreeMap } from "./types";

// TODO: this function is currently unused
export function addToTree(
  diffTreeMap: DiffTreeMap,
  filePath: string,
  status: DiffStatus
) {
  const parts = filePath.split("\\");
  const newParts = [];
  while (parts.length > 0 && !(parts.join("\\") in diffTreeMap)) {
    newParts.unshift(parts.pop());
  }
  let parentPath = parts.join("\\");
  while (newParts.length > 0) {
    const newPath =
      parentPath === ""
        ? newParts.shift()!
        : parentPath + "\\" + newParts.shift();
    const parent = diffTreeMap[parentPath] as DiffTree;
    if (newParts.length === 0) {
      diffTreeMap[newPath] = {
        type: "file",
        path: newPath,
        status,
      };
    } else {
      diffTreeMap[newPath] = {
        type: "tree",
        path: newPath,
        children: [],
        populated: false,
        expanded: false,
        status: DiffStatus.None,
      };
    }
    parent.children.push(newPath);
    parent.children.sort((a, b) => {
      return (
        diffTreeMap[b].type.localeCompare(diffTreeMap[a].type) ||
        a.localeCompare(b)
      );
    });
    parentPath = newPath;
  }
}
