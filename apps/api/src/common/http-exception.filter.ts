import { Catch, HttpException, HttpStatus, Logger, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

/** Every error leaves the API as `{ code, message }`. Adapter-agnostic on purpose. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;
    const res: unknown = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const code =
        typeof body === 'object' && body !== null && 'code' in body ? String(body.code) : (HttpStatus[status] ?? 'ERROR');
      httpAdapter.reply(res, { code, message: exception.message }, status);
      return;
    }

    this.logger.error(exception);
    httpAdapter.reply(res, { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' }, 500);
  }
}
