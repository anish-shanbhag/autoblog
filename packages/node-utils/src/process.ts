import { execSync, spawn } from "child_process";
import { existsSync } from "fs";
import path from "path";

export const binPaths: Record<string, string> = {};

export function runProcess(
  command: string,
  args?: string[],
  options: {
    cwd?: string;
    env?: Record<string, string>;
    fullOutput?: boolean;
  } = {}
): Promise<string> {
  const cwd = options.cwd ?? process.cwd();
  if (!binPaths[cwd]) {
    binPaths[cwd] = execSync("npm bin", { cwd }).toString().trim();
  }
  let commandPath = path.join(binPaths[cwd], command);
  if (!existsSync(commandPath)) {
    // fall back to the command name if it's not in the NPM bin path
    commandPath = command;
  }
  if (process.env.FULL_OUTPUT) {
    const padding = "=".repeat(30);
    process.stdout.write(
      `${padding} RUN COMMAND ${command} ${args?.join(" ") ?? ""} ${padding}\n`
    );
  }
  return new Promise((resolve, reject) => {
    const childProcess = spawn(commandPath, args ?? [], {
      shell: true,
      cwd,
      env: options.env,
      stdio: process.env.FULL_OUTPUT || options.fullOutput ? "inherit" : "pipe",
    });
    let stdout = "";
    let stderr = "";
    childProcess.stdout?.on("data", (data) => {
      stdout += data;
    });
    childProcess.stderr?.on("data", (data) => {
      stderr += data;
    });
    childProcess.on("error", reject);
    childProcess.on("close", (code, signal) => {
      if (code || signal) {
        reject(stderr || stdout || code);
      } else {
        resolve(stdout);
      }
    });
  });
}
