/******************************************************************************/
/* A class used to standardize responses from the Logger class
/**************************************************************************** */
export class LogResponse {
  public status: number;
  public statusText: string;
  /**
   * Constructs a response containing the a logs status and status text.
   * @param status The final status of the log request.
   * @param statusText Corresponding status text of the completed log request.
   */
  constructor(status: number, statusText: string) {
    this.status = status;
    this.statusText = statusText;
  }
}

export default LogResponse;
