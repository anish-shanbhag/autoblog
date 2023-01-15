import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

export const cryogenPath = path.join(
  process.env.APPDATA ??
    (process.platform === "darwin"
      ? process.env.HOME + "/Library/Preferences"
      : process.env.HOME + "/.local/share"),
  "cryogen"
);

export const recipeInstallPath = path.join(cryogenPath, "packages");

export const metadataPath = path.join(cryogenPath, "metadata");

export async function readJson(filePath: string) {
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents) as Record<string, unknown>;
}

export interface PackageMetadata {
  // saving CLI version in case we need to account for breaking changes
  cliVersion: string;
  lastInstalled: number; // timestamp
  isLocal: boolean;
}

export function getMetadataPath(name: string) {
  return path.join(metadataPath, name + ".json");
}

export async function getMetadata<T extends object = PackageMetadata>(
  packageName: string
) {
  const metadataPath = getMetadataPath(packageName);
  return existsSync(metadataPath)
    ? ((await readJson(metadataPath)) as unknown as T)
    : undefined;
}

export async function updateMetadata<T extends object = PackageMetadata>(
  packageName: string,
  newMetadata: {
    [K in keyof T]: T[K] | undefined;
  }
) {
  const metadataPath = getMetadataPath(packageName);
  const oldMetadata: Partial<T> = (await getMetadata(packageName)) ?? {};

  if (!existsSync(path.dirname(metadataPath))) {
    await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  }

  const metadataCopy = { ...oldMetadata };
  for (const key in newMetadata) {
    if (newMetadata[key] === undefined) {
      delete metadataCopy[key];
    } else {
      metadataCopy[key] = newMetadata[key];
    }
  }

  await fs.writeFile(metadataPath, JSON.stringify(metadataCopy, null, 2));
}

export async function getRunning() {
  const runningMetadata = await getMetadata<Record<string, boolean>>(
    "_running"
  );
  return runningMetadata ?? {};
}

export async function updateRunning(value: boolean | undefined) {
  await updateMetadata<Record<string, boolean>>("_running", {
    [process.cwd()]: value,
  });
}

export async function deleteMetadataFile(name: string) {
  const metadataPath = getMetadataPath(name);
  if (existsSync(metadataPath)) {
    await fs.unlink(metadataPath);
  }
}
