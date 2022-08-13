import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

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
  newMetadata: T
) {
  const metadataPath = getMetadataPath(packageName);
  const oldMetadata: Partial<T> = (await getMetadata(packageName)) ?? {};

  if (!existsSync(path.dirname(metadataPath))) {
    await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  }
  await fs.writeFile(
    metadataPath,
    JSON.stringify({ ...oldMetadata, ...newMetadata }, null, 2)
  );
}

export async function deleteMetadata(name: string) {
  const metadataPath = getMetadataPath(name);
  if (existsSync(metadataPath)) {
    await fs.unlink(metadataPath);
  }
}
