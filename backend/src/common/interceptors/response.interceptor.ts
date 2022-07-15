import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '@/common/dtos/response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data === undefined) data = null;
        if (!data?.statusCode || data?.statusCode === 200) return { data, error: null, isSuccess: true };
        return data;
      }),
    );
  }
}
