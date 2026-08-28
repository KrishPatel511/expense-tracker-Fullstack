import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

// Ye filter har error ko ek consistent JSON format me bhejta hai
// { success: false, statusCode, message, path, timestamp }
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const errCode = (exception as any)?.code ?? (exception as any)?.keyPattern ? 11000 : null;
    const isMongoDupe = errCode === 11000;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : isMongoDupe
          ? HttpStatus.CONFLICT
          : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : isMongoDupe
          ? 'Email already registered'
          : (exception as any)?.message || 'Internal server error';

    response.status(status).json({
      success: false,
      statusCode: status,
      message: (message as any)?.message || message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
