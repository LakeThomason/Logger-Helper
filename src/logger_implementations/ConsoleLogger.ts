import chalk from "chalk";
import ILogger from "../ILogger";
import { LogLevel } from "../LogLevelsEnum";
import LogResponse from "../LogResponse";
/**
 * A helper class that lets someone construct a simplified async
 * console logger.
 */
export class ConsoleLogger implements ILogger {

    constructor() {
        // tslint:disable-next-line:no-console
        console.log(chalk.blueBright("Constructing console logger - All logs using this logger will only be logged to the console."));
    }

    public log(level: LogLevel, msg: string, err?: Error, innerException?: Error): Promise<LogResponse> {

        let message = "";
        if (level === LogLevel.info) {
            message = `${this.colorWarningLevel(LogLevel.info)} ${msg}`;
        } else {
            message = `${this.colorWarningLevel(level)} ${msg}${err ? ` ------STACK TRACE------ ` + err.stack : ""}${innerException
                ? ` ------INNER EXCEPTION TRACE------ ` + innerException.stack
                : ""}`;
        }

        return new Promise<LogResponse>(() => {
            // tslint:disable-next-line:no-console
            console.log(message);
            return null;
        });
    }

    public logWarn(message: string, exception?: Error, innerException?: Error): Promise<LogResponse> {
        return this.log(LogLevel.warn, message, exception, innerException);
    }

    public logFatal(message: string, exception?: Error, innerException?: Error): Promise<LogResponse> {
        return this.log(LogLevel.fatal, message, exception, innerException);
    }

    public logInfo(message: string, exception?: Error, innerException?: Error): Promise<LogResponse> {
        return this.log(LogLevel.info, message, exception, innerException);
    }

    public logDebug(message: string, exception?: Error, innerException?: Error): Promise<LogResponse> {
        return this.log(LogLevel.debug, message, exception, innerException);
    }

    public logError(message: string, exception?: Error, innerException?: Error): Promise<LogResponse> {
        return this.log(LogLevel.error, message, exception, innerException);
    }

    public logSilly(message: string, exception?: Error, innerException?: Error): Promise<LogResponse> {
        return this.log(LogLevel.silly, message, exception, innerException);
    }

    private colorWarningLevel(level: LogLevel): string {
        switch (level) {
            case (LogLevel.debug): {
                return chalk.magentaBright(`${level}:`);
            }
            case (LogLevel.info): {
                return chalk.cyan(`${level}:`);

            }
            case (LogLevel.warn): {
                return chalk.yellow(`${level}:`);

            }
            case (LogLevel.error): {
                return chalk.red(`${level}:`);

            }
            case (LogLevel.fatal): {
                return chalk.redBright.underline.bold(`${level}:`);

            }
            case (LogLevel.silly): {
                return chalk.red("S") + chalk.yellow("I") + chalk.green("L") + chalk.blue("L") + chalk.magenta("Y") + chalk.redBright(":");
            }
            default: {
                return `${level}:`;
            }
        }
    }
}

export default ConsoleLogger;
