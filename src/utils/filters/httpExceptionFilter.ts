// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import { HttpAdapterHost } from '@nestjs/core';
// import { WsException } from '@nestjs/websockets';

// export interface HttpExceptionResponse {
//   statusCode: number;
//   message: string;
//   error: string;
// }

// @Catch()
// export class AllExceptionsFilter implements ExceptionFilter {
//   constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

//   catch(exception: unknown, host: ArgumentsHost): void {
//     const contextType = host.getType();

//     if (contextType === 'http') {
//       console.log('http Exception:', exception);
//       this.handleHttpException(exception, host);
//     } else if (contextType === 'ws') {
//       console.log('WS Exception:', exception);
//       this.handleWsException(exception, host);
//     } else {
//       console.error('Unhandled exception type:', contextType, exception);
//     }
//   }

//   private handleHttpException(exception: unknown, host: ArgumentsHost): void {
//     const { httpAdapter } = this.httpAdapterHost;
//     const ctx = host.switchToHttp();

//     const httpStatus =
//       exception instanceof HttpException
//         ? exception.getStatus()
//         : HttpStatus.INTERNAL_SERVER_ERROR;

//     const exceptionResponse =
//       exception instanceof HttpException
//         ? exception.getResponse()
//         : String(exception);

//     const responseBody = {
//       success: false,
//       statusCode: httpStatus,
//       timestamp: new Date().toISOString(),
//       path: httpAdapter.getRequestUrl(ctx.getRequest()),
//       message:
//         (exceptionResponse as HttpExceptionResponse).error ||
//         (exceptionResponse as HttpExceptionResponse).message ||
//         exceptionResponse ||
//         'Something went wrong',
//       errorResponse: exceptionResponse as HttpExceptionResponse,
//     };

//     httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
//   }

//   private handleWsException(exception: unknown, host: ArgumentsHost): void {
//     const client = host.switchToWs().getClient();

//     const message =
//       exception instanceof WsException
//         ? exception.message
//         : exception instanceof HttpException
//           ? exception.getResponse()
//           : 'Internal server error';

//     const response = {
//       success: false,
//       timestamp: new Date().toISOString(),
//       message,
//     };

//     client.emit('exception', response);
//   }
// }

// all-exceptions.filter.ts
// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
//   HttpStatus,
//   Logger,
// } from '@nestjs/common';
// import { HttpAdapterHost } from '@nestjs/core';
// import { WsException } from '@nestjs/websockets';
// import { CustomWsException, WsStatus } from './custom-ws.exception';

// export interface HttpExceptionResponse {
//   statusCode: number;
//   message: string;
//   error: string;
// }

// @Catch()
// export class AllExceptionsFilter implements ExceptionFilter {
//   private readonly logger = new Logger(AllExceptionsFilter.name);

//   constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

//   catch(exception: unknown, host: ArgumentsHost): void {
//     const contextType = host.getType();

//     this.logger.error('Exception caught:', {
//       type: contextType,
//       exception: this.formatError(exception),
//     });

//     if (contextType === 'http') {
//       this.handleHttpException(exception, host);
//     } else if (contextType === 'ws') {
//       this.handleWsException(exception, host);
//     } else {
//       this.logger.error('Unhandled exception type:', {
//         type: contextType,
//         exception: this.formatError(exception),
//       });
//     }
//   }

//   private formatError(exception: unknown): any {
//     if (exception instanceof Error) {
//       return {
//         name: exception.name,
//         message: exception.message,
//         stack: exception.stack,
//       };
//     }
//     return exception;
//   }

//   private handleHttpException(exception: unknown, host: ArgumentsHost): void {
//     const { httpAdapter } = this.httpAdapterHost;
//     const ctx = host.switchToHttp();

//     const httpStatus =
//       exception instanceof HttpException
//         ? exception.getStatus()
//         : HttpStatus.INTERNAL_SERVER_ERROR;

//     const exceptionResponse =
//       exception instanceof HttpException
//         ? exception.getResponse()
//         : String(exception);

//     const responseBody = {
//       success: false,
//       statusCode: httpStatus,
//       timestamp: new Date().toISOString(),
//       path: httpAdapter.getRequestUrl(ctx.getRequest()),
//       message:
//         (exceptionResponse as HttpExceptionResponse).error ||
//         (exceptionResponse as HttpExceptionResponse).message ||
//         exceptionResponse ||
//         'Something went wrong',
//       errorResponse: exceptionResponse as HttpExceptionResponse,
//     };

//     this.logger.error('HTTP Exception Response:', responseBody);
//     httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
//   }

//   private handleWsException(exception: unknown, host: ArgumentsHost): void {
//     const client = host.switchToWs().getClient();
//     const data = host.switchToWs().getData();

//     let status = WsStatus.INTERNAL_SERVER_ERROR;
//     let message = 'Internal server error';
//     let additionalData = undefined;

//     if (exception instanceof CustomWsException) {
//       status = exception.status;
//       message = exception.message;
//       additionalData = exception.data;
//     } else if (exception instanceof WsException) {
//       message = exception.message;
//     } else if (exception instanceof HttpException) {
//       status = exception.getStatus();
//       message = exception.message;
//     }

//     const response = {
//       success: false,
//       status,
//       timestamp: new Date().toISOString(),
//       message,
//       data: additionalData || data,
//     };

//     this.logger.error('WebSocket Exception:', {
//       clientId: client.id,
//       status,
//       exception: this.formatError(exception),
//       response,
//     });

//     client.emit('exception', response);
//   }
// }

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { CustomWsException } from './custom-ws.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttp = !!response && !!request;
    const isWebSocket = host.getType() === 'ws';

    let status: number;
    let message: string;
    let data: any;

    if (exception instanceof CustomWsException) {
      status = exception.status;
      message = exception.message;
      data = exception.data;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      data = exception.getResponse();
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      data = null;
    }

    if (isHttp) {
      response.status(status).json({
        status: 'error',
        message,
        data,
        timestamp: new Date().toISOString(),
      });
    } else if (isWebSocket) {
      const client = host.switchToWs().getClient();
      client.emit('exception', {
        status: 'error',
        message,
        data,
        timestamp: new Date().toISOString(),
      });
    }

    this.logger.error(`Exception: ${message}`, exception);
  }
}
