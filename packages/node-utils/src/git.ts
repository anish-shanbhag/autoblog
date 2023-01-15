import { runProcess } from "./process";

export const gitArgs = ["--git-dir", ".cryogen", "--work-tree", "."];
export const commitArgs = [...gitArgs, "commit", "-m", "base", "--allow-empty"];

/**
 * Convenience function for running git commands with the correct git directory.
 */
export function git(...args: string[]) {
  return runProcess("git", [...gitArgs, ...args]);
}
