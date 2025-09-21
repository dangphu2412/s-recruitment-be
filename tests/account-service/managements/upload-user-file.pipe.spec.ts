import { BadRequestException } from '@nestjs/common';
import { UploadUserFileValidatorPipe } from '../../../src/account-service/management/upload-user-file.pipe';
import { InternalFile } from '../../../src/system/file/file.interceptor';

describe('UploadUserFileValidatorPipe', () => {
  let pipe: UploadUserFileValidatorPipe;

  beforeEach(() => {
    pipe = new UploadUserFileValidatorPipe();
  });

  it('should return file when valid (size < 50KB, allowed mimetype)', () => {
    // Arrange
    const file: InternalFile = {
      encoding: 'utf-9',
      fieldname: 'fieldname',
      size: 1024, // 1 KB
      mimetype:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('test'),
      originalname: 'test.xlsx',
    };

    // Act
    const result = pipe.transform(file);

    // Assert
    expect(result).toBe(file);
  });

  it('should throw BadRequestException if file too large', () => {
    // Arrange
    const file: InternalFile = {
      encoding: 'utf-9',
      fieldname: 'fieldname',
      size: 1024 * 51, // 51 KB
      mimetype:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('test'),
      originalname: 'large.xlsx',
    };

    // Act & Assert
    expect(() => pipe.transform(file)).toThrow(BadRequestException);
    expect(() => pipe.transform(file)).toThrow(/File should be less than/);
  });

  it('should throw BadRequestException if invalid mimetype', () => {
    // Arrange
    const file: InternalFile = {
      encoding: 'utf-9',
      fieldname: 'fieldname',
      size: 1024, // 1 KB
      mimetype: 'text/plain',
      buffer: Buffer.from('test'),
      originalname: 'bad.txt',
    };

    // Act & Assert
    expect(() => pipe.transform(file)).toThrow(BadRequestException);
    expect(() => pipe.transform(file)).toThrow(/Invalid mimetype/);
  });
});
