import { sync } from "execa";
import stripAnsi from "strip-ansi";
const defaultShell = process.env.SHELL || "/bin/bash";

const args = ["-ilc", 'echo -n "_SHELL_ENV_DELIMITER_"; env; echo -n "_SHELL_ENV_DELIMITER_"; exit'];

const env = {
  // Disables Oh My Zsh auto-update thing that can block the process.
  DISABLE_AUTO_UPDATE: "true"
};

const parseEnv = (env) => {
  env = env.split("_SHELL_ENV_DELIMITER_")[1];
  const ret = {};

  for (const line of stripAnsi(env)
    .split("\n")
    .filter((line) => Boolean(line))) {
    const [key, ...values] = line.split("=");
    ret[key] = values.join("=");
  }

  return ret;
};

function shellEnv() {
  try {
    const { stdout } = sync(defaultShell, args, { env });
    return parseEnv(stdout);
  } catch (error) {
    return process.env;
  }
}

export default function () {
  if (process.platform !== "darwin") {
    return;
  }
  process.env.PATH = shellEnv().PATH || ["./node_modules/.bin", "/.nodebrew/current/bin", "/usr/local/bin", process.env.PATH].join(":");
}
