# logger_class_library

Class library that serves as a layer between the logger service and an application

# Installation

`npm install post_ltr_logger`

# Usage

```javascript
import { ILoggerConstructor, Logger } from "post_ltr_logger";
const emailList: string[] = JSON.parse(process.env.EMAIL_LIST);
const emailPort: number = parseInt(process.env.NOTIFICATION_PORT, 10);
const config: ILoggerConstructor = {
  applicationName: "finally",
  emailHost: process.env.NOTIFICATION_HOST,
  emailList,
  emailPort,
  logAPI: process.env.LOG_API,
  nodeENV: process.env.NODE_ENV,
  senderEmail: process.env.NOTIFICATION_EMAIL,
  token: "bearer xxxxxx",
  userID: "testo"
};
const log = new Logger(config);
log.logInfo("Logger is running :)");
```
