import { spawn } from "child_process";
import path from "path";

export const recipeInstallPath = path.join(
  process.env.APPDATA ??
    (process.platform === "darwin"
      ? process.env.HOME + "/Library/Preferences"
      : process.env.HOME + "/.local/share"),
  "scaffolding" // TODO: rename scaffolding
);

export function runProcess(...args: Parameters<typeof spawn>): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(...args);
    process.on("error", reject);
    process.on("close", (code) => {
      if (code) {
        reject(code);
      } else {
        resolve();
      }
    });
  });
}
