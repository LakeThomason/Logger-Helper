import ILogRequestBody from "./ILogRequestBody";
import LogLevel from "./LogLevelsEnum";
/******************************************************************************/
/* Implementation of the ILogRequestBody interface because js/ts doesnt
/* type check at runtime >:(
/*
/* This class is used to type check the request body sent to the log service
/* Subject to change if the log service changes (it will ._.)
/**************************************************************************** */
export class LogRequestBody implements ILogRequestBody {
  public creationDate: string;
  public level: LogLevel;
  public message: string;
  public serverId: string;
  public userId: string;

  constructor(
    creationDate: string,
    level: LogLevel,
    message: string,
    serverId: string,
    userId: string
  ) {
    this.creationDate = creationDate;
    this.level = level;
    this.message = message;
    this.serverId = serverId;
    this.userId = userId;
  }
}

export default LogRequestBody;
