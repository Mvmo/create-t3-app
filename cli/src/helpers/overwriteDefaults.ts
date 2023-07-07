import chalk from "chalk";
import fs from "fs-extra";
import { Ora } from "ora";
import path from "path";
import { env } from "process";

// this function first checks if one of the following env variables is set
// T3_CONFIG, XDG_CONFIG_HOME, HOME
// if so given path is joined with t3stack/ (unless it's the T3_CONFIG var, then it uses the directory directly) and overwrites/
// then the first path, which exists, is returned
const getOverwritePath = (): string | undefined => {
  return ["T3_CONFIG", "XDG_CONFIG_HOME", "HOME"]
    .map((key) => [key, env[key]])
    .filter(([_, envValue]) => envValue !== undefined)
    .map(([envKey, envValue]) =>
      path.join(
        envValue as string,
        envKey === "T3_CONFIG" ? "." : "t3stack",
        "overwrites"
      )
    )
    .find(fs.existsSync);
};

export const overwriteDefaults = (spinner: Ora, projectPath: string) => {
  const overridePath = getOverwritePath();
  if (!overridePath) return;

  spinner.info(
    chalk.green(
      `Found overwrites directory - ${chalk.bgGreen(chalk.white(overridePath))}`
    )
  );

  fs.copySync(overridePath, projectPath, { overwrite: true });

  spinner.info(
    chalk.green("Successfully copied overwrites into just created project")
  );
};
