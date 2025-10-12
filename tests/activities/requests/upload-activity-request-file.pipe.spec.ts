import { BadRequestException } from '@nestjs/common';
import { UploadRequestActivityFileValidatorPipe } from '../../../src/activities/requests/presentation/upload-activity-request-file.pipe';
import { InternalFile } from '../../../src/system/file/file.interceptor';

describe('UploadRequestActivityFileValidatorPipe', () => {
  let pipe: UploadRequestActivityFileValidatorPipe;

  beforeEach(() => {
    pipe = new UploadRequestActivityFileValidatorPipe();
  });

  it('should return file when valid size and valid mimetype', () => {
    const mockFile = {
      size: 150 * 1024,
      mimetype:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    } as InternalFile;

    const result = pipe.transform(mockFile);

    expect(result).toBe(mockFile);
  });

  it('should throw BadRequestException when file size exceeds 200KB', () => {
    const mockFile = {
      size: 250 * 1024,
      mimetype:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    } as InternalFile;

    expect(() => pipe.transform(mockFile)).toThrow(BadRequestException);
    expect(() => pipe.transform(mockFile)).toThrow(
      'File should be less than 204800',
    );
  });

  it('should throw BadRequestException when mimetype is invalid', () => {
    const mockFile = {
      size: 100 * 1024,
      mimetype: 'image/png',
    } as InternalFile;

    expect(() => pipe.transform(mockFile)).toThrow(BadRequestException);
    expect(() => pipe.transform(mockFile)).toThrow('Invalid mimetype');
  });

  it('should allow file with application/octet-stream mimetype', () => {
    const mockFile = {
      size: 180 * 1024,
      mimetype: 'application/octet-stream',
    } as InternalFile;

    const result = pipe.transform(mockFile);

    expect(result).toBe(mockFile);
  });
});
