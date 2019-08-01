import axios from "axios";
import nodemailer from "nodemailer";
import ILogger from "../ILogger";
import ILoggerConstructor from "../ILoggerConstructor";
import ILogRequestBody from "../ILogRequestBody";
import LogLevel from "../LogLevelsEnum";
import LogResponse from "../LogResponse";

const devENV = "development";
const testENV = "test";
const prodENV = "production";
/******************************************************************************/
/* Concrete class of ILogger
/* Should be used to save any log to the Log collection on mongo through
/* the log service
/**************************************************************************** */
export class Logger implements ILogger {
  /**
   * QOL function -
   * Sends empty configuration object
   */
  public static getConfig() {
    const config: ILoggerConstructor = {
      applicationName: undefined,
      emailHost: undefined,
      emailList: undefined,
      emailPort: undefined,
      logAPI: undefined,
      nodeENV: undefined,
      senderEmail: undefined,
      token: undefined,
      userID: undefined
    };
    return config;
  }
  private config: ILoggerConstructor;
  constructor(config: ILoggerConstructor) {
    this.config = config;
  }
  /**
   * Something that's concerning but not causing the operation to abort;
   * Could be # of connections in the DB pool getting low, an unusual-but-expected timeout in an operation.
   * Good for reporting poor health of an application
   * @param message Message to be logged.
   * @param exception Exception thrown.
   * @param innerException Inner exception thrown.
   */
  public logWarn(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<LogResponse> {
    return this.log(LogLevel.warn, message, exception, innerException);
  }
  /**
   * Something that the app's doing that it shouldn't. This isn't a user error ('invalid search query');
   * It's an assertion failure, network problem, etc etc., probably one that is going to abort the current operation
   * @param message Message to be logged.
   * @param exception Exception thrown.
   * @param innerException Inner exception thrown.
   */
  public logError(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<LogResponse> {
    return this.log(LogLevel.error, message, exception, innerException);
  }
  /**
   * The app is about to die horribly. This is where the info explaining why that's happening goes.
   * This error sends an email to recipients defined in the .env file
   * @param message Message to be logged.
   * @param exception Exception thrown.
   * @param innerException Inner exception thrown.
   */
  public logFatal(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<LogResponse> {
    return this.sendEmail(message, exception, innerException)
      .then(() => {
        return this.log(LogLevel.fatal, message, exception, innerException);
      })
      .catch((error) => {
        this.log(LogLevel.fatal, message, exception, innerException);
        return Promise.reject(new LogResponse(503, error.stack));
      });
  }
  /**
   * Normal logging that's part of the normal operation of the app;
   * Diagnostic stuff so you can go back and say 'how often did this broad-level operation happen?', or
   * 'how did the user's data get into this state?'
   * @param message Message to be logged.
   * @param exception Exception thrown.
   * @param innerException Inner exception thrown.
   */
  public logInfo(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<LogResponse> {
    return this.log(LogLevel.info, message, exception, innerException);
  }
  /**
   * This is where you might log detailed information about key method parameters or other
   * information that is useful for finding likely problems in specific 'problematic' areas of the code.
   * @param message Message to be logged.
   * @param exception Exception thrown.
   * @param innerException Inner exception thrown.
   */
  public logDebug(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<LogResponse> {
    return this.log(LogLevel.debug, message, exception, innerException);
  }
  /**
   * There aren't many reasons to use this log method.
   * I can still think of a few though:
   * 1. u just wanna leave an easter egg in the code
   * 2. draw some ascii art in the db
   * 3. u want to see if ryan catches your obscure/obfuscated log
   * 4. ¯\_(ツ)_/¯
   * @param message Message to be logged.
   * @param exception Exception thrown.
   * @param innerException Inner exception thrown.
   */
  public logSilly(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<LogResponse> {
    return this.log(LogLevel.silly, message, exception, innerException);
  }
  /**
   * Generic log statement that sends log to log service
   * @param level Log level of message.
   * @param message Message to be logged.
   * @param exception Exception thrown.
   * @param innerException Inner exception thrown.
   */
  public log(
    level: LogLevel,
    msg: string,
    err?: Error,
    innerException?: Error
  ): Promise<LogResponse> {
    // Construct message to be saved
    const message = `${msg}${
      err ? ` ------STACK TRACE------ ` + err.stack : ""
      }${
      innerException
        ? ` ------INNER EXCEPTION TRACE------ ` + innerException.stack
        : ""
      }`;
    // Prepare request body of log service request
    const requestBody: ILogRequestBody = {
      creationDate: this.formatNewDate(),
      level,
      message,
      serverId: this.config.applicationName,
      userId: this.config.userID
    };
    // If the log is made in a test or dev environment
    // console.log the log and return a 200 OK
    if (!this.config.nodeENV) {
      this.config.nodeENV = testENV;
    } // default to test if no env is set
    if (
      this.config.nodeENV.toLowerCase() === devENV ||
      this.config.nodeENV.toLowerCase() === testENV
    ) {
      console.dir(requestBody);
      return new Promise((resolve) => resolve(new LogResponse(200, "OK")));
    } else if (this.config.nodeENV.toLowerCase() === prodENV) {
      // Make the request, return the promise for the caller to subscribe to
      return new Promise((resolve, reject) => {
        this.makeRequest(requestBody)
          .then((res) => {
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    }
  }
  /**
   * Makes a request to the log service with authorization.
   * @param requestBody Body of the request to the log service
   */
  private makeRequest(requestBody: ILogRequestBody): Promise<LogResponse> {
    return new Promise((resolve, reject) => {
      axios
        .post(this.config.logAPI, requestBody, {
          headers: {
            "Authorization": this.config.token,
            "Content-Type": "application/json"
          }
        })
        .then((response) => {
          resolve(new LogResponse(response.status, response.statusText));
        })
        .catch((error) => {
          reject(new LogResponse(error.status, error.statusText));
        });
    });
  }
  /**
   * Sends formmatted email to list of recipients defined in .env file
   * @param message Message to be emailed to recipients
   * @param exception Exception thrown
   * @param innerException Inner exception thrown
   */
  private sendEmail(
    message: string,
    exception?: Error,
    innerException?: Error
  ): Promise<Error | any> {
    // Define the transporter with SMTP IP address and port
    const transporter = nodemailer.createTransport({
      host: this.config.emailHost,
      port: this.config.emailPort
    });
    // Prepare email to be sent to recipients
    const email =
      "This is an automated email generated by LTR log service. " +
      "Do not reply to this email.\n" +
      "\n" +
      "Application: " +
      this.config.applicationName +
      "\n\n" +
      "Level: " +
      LogLevel.fatal +
      "\n\n" +
      "Message: " +
      message +
      `${exception ? "\n\nException: " + exception.stack : ""}` +
      `${innerException ? "\n\nInner exception: " + innerException.stack : ""}`;
    const emailDetails = {
      from: this.config.senderEmail,
      subject: `${
        this.config.applicationName
        } FATAL ERROR on ${this.formatNewDate()}`,
      text: email,
      to: this.config.emailList
    };
    // Send email, throw error if failed
    return new Promise((resolve, reject) => {
      transporter.sendMail(emailDetails, (error, info) => {
        console.log(error);
        if (error) {
          reject(
            new Error("Email failed to send. Recipients were NOT notified.")
          );
        } else if (info) {
          resolve(info);
        }
      });
    });
  }

  /**
   * Returns the current time and date in mm/dd/yyyy - hh:mm:ss
   */
  private formatNewDate(): string {
    const date = new Date();
    return `${date.getMonth() +
      1}/${date.getDate()}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }
}
