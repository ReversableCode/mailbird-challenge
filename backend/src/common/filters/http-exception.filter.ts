import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { IResponse } from '@/common/dtos/response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      let message = exception.getResponse() as any;
      if (message instanceof Object && message.message !== undefined) {
        message = message.message;
      }

      response.status(status).json({
        data: message,
        error: exception.name,
        isSuccess: false,
      } as IResponse<null>);
    } else {
      response.status(500).json({
        data: null,
        error: 'Internal server error',
        isSuccess: false,
      } as IResponse<null, string>);
    }
  }
}
