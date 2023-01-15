import path from "path";

import { FileItem, FileStatus, FileTree } from "@cryo/utils";

import { getPopulatedFileItems } from "./populate";
import { explorerWebview, fileTreeMap } from "./state";

// keeps track of the updated FileItems during a call to updateFileTreeMap
// need to use a map to maintain insertion order of keys
// array also doesn't work because duplicate entries for a single path would be added
const fileItemsMap: Map<string, FileItem> = new Map();

/**
 * Given a list of FileItems, this function will update the fileTreeMap, handle any
 * changes needed to other FileItems in the process, and send the full array of FileItems
 * to the webview. This includes adding new FileItems to their parent's children,
 * recursively populating the parents of the FileItems where needed, and propagating
 * status changes to parents.
 */
export async function updateFileTreeMap(fileItems: FileItem[]) {
  fileItemsMap.clear();
  for (const fileItem of fileItems) {
    await updateFileItem(fileItem);
  }

  explorerWebview?.postMessage({
    type: "diff",
    fileItems: [...fileItemsMap.values()],
  });
}

export async function updateFileItem(fileItem: FileItem) {
  if (fileItem.status === FileStatus.RemovedFromTree) {
    removeFromTree(fileItem);
  } else {
    await replaceFileItem(fileItem);
  }
}

async function replaceFileItem(fileItem: FileItem) {
  // recursively populate the parent of the fileItem if it hasn't already been populated
  if (!getParentFileTree(fileItem)?.populated) {
    await recursivelyPopulateFileItems(fileItem.path);
  }

  const oldFileItem = fileTreeMap[fileItem.path];

  // update the fileItem in the fileTreeMap and add it to the set of changed fileItems
  fileTreeMap[fileItem.path] = fileItem;
  fileItemsMap.set(fileItem.path, fileItem);

  // add the fileItem to its parent's children if it doesn't already exist there
  if (!oldFileItem) {
    const parentFileTree = getParentFileTree(fileItem)!;
    const newChildren = [...parentFileTree.children];
    insertChild(newChildren, fileItem.path);
    replaceFileItem({
      ...parentFileTree,
      populated: true,
      children: newChildren,
    });
  }

  // bubble up status updates to the parent if needed
  if (oldFileItem?.status !== fileItem.status) {
    propagateStatusToParent(fileItem);

    // recursively remove all children of deleted file trees
    if (fileItem.status === FileStatus.Deleted && fileItem.type === "tree") {
      for (const child of fileItem.children) {
        replaceFileItem({
          ...fileTreeMap[child],
          status: FileStatus.Deleted,
        });
      }
    }
  }
}

/**
 * Gets the parent FileTree of a FileItem. Also handles the special case of the root FileTree.
 */
export function getParentFileTree(fileItem: { path: string }) {
  const parentPath = (path.dirname(fileItem.path) + "/").replace(/^\.\/$/, "");
  return fileTreeMap[parentPath] as FileTree | undefined;
}

/**
 * Inserts a FileItem into its parent's children using binary search.
 */
// TODO: is performance optimization really needed?
function insertChild(children: string[], newChild: string) {
  let low = 0,
    high = children.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    const comparison =
      fileTreeMap[children[mid]].type.localeCompare(
        fileTreeMap[newChild].type
      ) || newChild.localeCompare(children[mid]);
    if (comparison > 0) low = mid + 1;
    else high = mid;
  }
  children.splice(low, 0, newChild);
}

/**
 * Propagates status changes to the parent of a FileItem. This is done by
 * iterating over the children and assigning the parent's status as the status of
 * one of its children with highest priority.
 */
function propagateStatusToParent(fileItem: FileItem) {
  const parentFileTree = getParentFileTree(fileItem);
  if (!parentFileTree) return;

  const statusPriorities = {
    [FileStatus.RemovedFromTree]: 0,
    [FileStatus.Added]: 1,
    [FileStatus.Modified]: 2,
    [FileStatus.Deleted]: 3,
    [FileStatus.HasDeletedChild]: 4,
    [FileStatus.None]: 5,
  };

  let newParentStatus = FileStatus.None;

  for (const child of parentFileTree.children) {
    const childStatus = fileTreeMap[child].status;
    if (statusPriorities[childStatus] < statusPriorities[newParentStatus]) {
      // Special case of handling deleted children: don't overwrite the status
      // of trees that are already known to be deleted; if not known to be
      // deleted, just mark the tree as having a deleted child
      if (
        childStatus === FileStatus.Deleted &&
        parentFileTree.status !== FileStatus.Deleted
      ) {
        newParentStatus = FileStatus.HasDeletedChild;
      } else {
        newParentStatus = childStatus;
      }
    }
  }

  // update the parent's status if it changed
  if (newParentStatus !== parentFileTree.status) {
    replaceFileItem({
      ...parentFileTree,
      status: newParentStatus,
    });
  }
}

/**
 * Removes a FileItem from the tree, handling both deletion from the fileTreeMap
 * and removal from its parent's children.
 */
function removeFromTree(fileItem: FileItem) {
  const parentFileTree = getParentFileTree(fileItem);
  delete fileTreeMap[fileItem.path];
  fileItemsMap.set(fileItem.path, fileItem);

  if (
    parentFileTree?.status === FileStatus.Added &&
    parentFileTree?.children.length === 1
  ) {
    removeFromTree(parentFileTree);
  } else if (parentFileTree) {
    replaceFileItem({
      ...parentFileTree,
      children: parentFileTree.children.filter(
        (child) => child !== fileItem.path
      ),
    });
  }
}

/**
 * Recursively populates the parents of a certain path, starting from the root
 * and working its way down to the path's actual parent.
 */
async function recursivelyPopulateFileItems(filePath: string) {
  const parts = filePath.replace(/\/$/, "").split("/");
  let currentPath = parts.shift()! + "/";

  while (parts.length > 0) {
    const currentFileTree = fileTreeMap[currentPath] as FileTree | undefined;
    if (!currentFileTree) {
      // If the current tree doesn't exist in the fileTreeMap, it means that it
      // doesn't exist on the filesystem but has a deleted child which still needs
      // to be shown. So, we still add it to the tree.
      updateFileItem({
        type: "tree",
        path: currentPath,
        children: [],
        populated: true,
        expanded: false,
        status: FileStatus.Deleted,
      });
    } else if (!currentFileTree.populated) {
      const populatedFileItems = await getPopulatedFileItems(currentPath);
      for (const populatedFileItem of populatedFileItems) {
        updateFileItem(populatedFileItem);
      }
    }

    currentPath = path.posix.join(currentPath, parts.shift()!) + "/";
  }
}
