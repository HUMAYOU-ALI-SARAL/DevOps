import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import JSONBigInt from 'json-bigint';

const JSONbigNative = JSONBigInt({
  useNativeBigInt: true,
  storeAsString: false,
});

@Injectable()
export class JsonBigintInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const response = context.switchToHttp().getResponse();
        response.setHeader('Content-Type', 'application/json');
        return JSONbigNative.stringify(data);
      }),
    );
  }
}
