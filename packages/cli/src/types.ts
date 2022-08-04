export interface PackageMetadata {
  [name: string]: {
    // saving CLI version in case we need to account for breaking changes
    cliVersion: string;
    lastInstalled: number; // timestamp
    isLocal: boolean;
  };
}
