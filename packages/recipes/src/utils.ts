import path from "path";

export function isNestedDirectory(dir1: string, dir2: string) {
  const originalDir1 = dir1;
  while (dir1 !== path.parse(dir1).root) {
    if (dir1 === dir2) {
      return true;
    }
    dir1 = path.dirname(dir1);
  }
  dir1 = originalDir1;
  while (dir2 !== path.parse(dir2).root) {
    if (dir1 === dir2) {
      return true;
    }
    dir2 = path.dirname(dir1);
  }
  return false;
}
