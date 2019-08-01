import LogLevel from "./LogLevelsEnum";
/******************************************************************************/
/* Enforces log request body parameters
/**************************************************************************** */
export interface ILogRequestBody {
  creationDate: string;
  level: LogLevel;
  message: string;
  serverId: string;
  userId: string;
}

export default ILogRequestBody;
