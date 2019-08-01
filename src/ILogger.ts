import LogLevel from "./LogLevelsEnum";
import LogResponse from "./LogResponse";

/******************************************************************************/
/* Interface implemented by Logger class
/* Could be helpful for testing I suppose?
/**************************************************************************** */
export interface ILogger {
  log(
    level: LogLevel,
    msg: string,
    err?: Error,
    innerException?: Error
  ): Promise<LogResponse>;
  logWarn(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<LogResponse>;
  logFatal(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<LogResponse>;
  logInfo(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<LogResponse>;
  logDebug(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<LogResponse>;
  logError(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<LogResponse>;
  logSilly(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<LogResponse>;
}

export default ILogger;
