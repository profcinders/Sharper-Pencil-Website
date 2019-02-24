import chalk from "chalk";
import stripColour from "strip-ansi";

export const info = str => {
    console.log(chalk.black.bgWhite(stripColour(str)));
};

export const error = err => {
    console.error(chalk.white.bgRed(stripColour(err instanceof Error ? err.message : err)));
};