export enum WsStatus {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export class CustomWsException extends Error {
  constructor(
    public readonly message: string,
    public readonly status: WsStatus = WsStatus.INTERNAL_SERVER_ERROR,
    public readonly data?: any,
  ) {
    super(message);
    this.name = 'CustomWsException';
  }
}
