import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import objectPath from 'object-path';

function parseBody(body: Record<string, any>) {
  const parsedObject = {};
  Object.keys(body).forEach((key) => {
    objectPath.set(parsedObject, key, body[key]);
  });
  return parsedObject;
}
export class CreateEventDtoParserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    request.body = parseBody(request.body);

    return next.handle();
  }
}
