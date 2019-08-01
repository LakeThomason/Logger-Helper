/******************************************************************************/
/* Interface for type checking incoming config options for Logger class
/**************************************************************************** */
export interface ILoggerConstructor {
  applicationName: string;
  emailHost: string;
  emailList: string[];
  emailPort: number;
  logAPI: string;
  nodeENV: string;
  senderEmail: string;
  token: string;
  userID: string;
}

export default ILoggerConstructor;
