import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  AppExceptionFilter,
  BusinessException,
  exceptionFactory,
} from '../../../src/system/exception/exception.service';

describe('Exception', () => {
  describe('BusinessException', () => {
    it('should store code and message', () => {
      const err = new BusinessException({
        code: 'BUS-001',
        message: 'Something broke',
      });

      expect(err).toBeInstanceOf(Error);
      expect(err.code).toBe('BUS-001');
      expect(err.message).toBe('Something broke');
    });
  });

  describe('exceptionFactory', () => {
    it('should return a BadRequestException', () => {
      const mockErrors = [
        {
          property: 'name',
          constraints: { isNotEmpty: 'name should not be empty' },
        },
      ] as any;
      const exception = exceptionFactory(mockErrors);

      expect(exception).toBeInstanceOf(BadRequestException);
      expect(exception.getResponse()).toEqual({
        error: 'Bad Request',
        message: '[object Object]',
        statusCode: 400,
      });
    });
  });

  describe('AppExceptionFilter', () => {
    let filter: AppExceptionFilter;
    let mockResponse: any;
    let mockRequest: any;
    let mockHost: ArgumentsHost;

    beforeEach(() => {
      filter = new AppExceptionFilter();

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      mockRequest = { url: '/test-endpoint' };
      mockHost = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as any;
    });

    it('should handle BusinessException with 422 response', () => {
      const businessError = new BusinessException({
        code: 'BUS-123',
        message: 'Custom biz error',
      });

      filter.catch(businessError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
          businessCode: 'BUS-123',
          message: 'Custom biz error',
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle HttpException with proper status code', () => {
      const httpError = new HttpException(
        'Forbidden access',
        HttpStatus.FORBIDDEN,
      );

      filter.catch(httpError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'Forbidden access',
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle unknown error with 500 response', () => {
      const unknownError = new Error('Unexpected fail');

      filter.catch(unknownError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Internal Server Error',
          path: '/test-endpoint',
        }),
      );
    });
  });
});
