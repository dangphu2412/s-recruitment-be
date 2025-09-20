import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import FastifyMulter from 'fastify-multer';
import { FileInterceptor } from '../../../src/system/file/file.interceptor';

type AnyObj = Record<string, any>;

jest.mock('fastify-multer', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('FileInterceptor', () => {
  const mockedMulter = FastifyMulter as unknown as jest.Mock;

  const makeHttpCtx = () => {
    const req = {} as AnyObj;
    const res = {} as AnyObj;

    const http = {
      getRequest: jest.fn(() => req),
      getResponse: jest.fn(() => res),
    };

    const ctx = {
      switchToHttp: jest.fn(() => http),
    } as unknown as ExecutionContext;

    return { ctx, http, req, res };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('success: merges options, calls single(fieldName), passes req/res, then calls next.handle', async () => {
    // Arrange
    const fieldName = 'file';
    const moduleOptions = { dest: 'uploads' } as AnyObj;

    const innerMiddleware = jest.fn((_req, _res, cb) => cb(null));
    const singleMethod = jest.fn(() => innerMiddleware);

    mockedMulter.mockReturnValue({ single: singleMethod });

    const InterceptorClass = FileInterceptor(fieldName);
    const interceptor = new InterceptorClass(moduleOptions);

    const { ctx, req, res } = makeHttpCtx();
    const next: CallHandler = { handle: jest.fn(() => of('ok')) };

    // Act
    const result$ = await interceptor.intercept(ctx, next);

    // Assert
    expect(FastifyMulter).toHaveBeenCalledWith({
      ...moduleOptions,
    });
    expect(singleMethod).toHaveBeenCalledWith(fieldName);
    expect(innerMiddleware).toHaveBeenCalledWith(
      req,
      res,
      expect.any(Function),
    );
    expect(next.handle).toHaveBeenCalledTimes(1);
    expect(result$).toBeDefined(); // it returns the next observable
  });

  it('error: rejects when mockedMulter callback passes an error', async () => {
    // Arrange
    const fieldName = 'file';
    const err = new Error('upload failed');

    const innerMiddleware = jest.fn((_req, _res, cb) => cb(err));
    const singleMethod = jest.fn(() => innerMiddleware);

    mockedMulter.mockReturnValue({ single: singleMethod });

    const InterceptorClass = FileInterceptor(fieldName);
    const interceptor = new InterceptorClass({} as AnyObj);

    const { ctx } = makeHttpCtx();
    const next: CallHandler = { handle: jest.fn(() => of('should-not-run')) };

    // Act + Assert
    await expect(interceptor.intercept(ctx, next)).rejects.toThrow(
      'upload failed',
    );
    expect(singleMethod).toHaveBeenCalledWith(fieldName);
    expect(next.handle).not.toHaveBeenCalled();
  });

  it('calls next.handle exactly once on success', async () => {
    // Arrange
    const fieldName = 'avatar';
    const innerMiddleware = jest.fn((_req, _res, cb) => cb(null));
    const singleMethod = jest.fn(() => innerMiddleware);

    mockedMulter.mockReturnValue({ single: singleMethod });

    const InterceptorClass = FileInterceptor(fieldName);
    const interceptor = new InterceptorClass({} as AnyObj);

    const { ctx } = makeHttpCtx();
    const next: CallHandler = { handle: jest.fn(() => of('ok')) };

    // Act
    await interceptor.intercept(ctx, next);

    // Assert
    expect(next.handle).toHaveBeenCalledTimes(1);
  });
});
