/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Use an installed Chrome when one exists (this workspace has no internet
// for Remotion's own browser download). On your own PC this is skipped
// automatically if the path doesn't exist, and Remotion downloads its browser.
import fs from "fs";
const localChrome = "/usr/bin/google-chrome";
if (fs.existsSync(localChrome)) {
  Config.setBrowserExecutable(localChrome);
  Config.setChromeMode("chrome-for-testing");
}
