import { createFileTest } from "../../utils";

// TODO: currently installed runs aren't tested on Node <= 14 because
// NPM v6 doesn't support workspaces
const nodeVersion = parseInt(process.version.split(".")[0]);

createFileTest(__dirname, {
  testInstallRun: nodeVersion > 14,
  testCachedRun: nodeVersion > 14,
});
