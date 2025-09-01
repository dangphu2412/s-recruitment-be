// mail.service.spec.ts
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { SendMailDTO } from '../../../src/system/mail/mail.interface';
import {
  LocalMailServiceImpl,
  MailServiceImpl,
} from '../../../src/system/mail/mail.service';

const logMock = jest.fn();
const errorMock = jest.fn();
const debugMock = jest.fn();

jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    Logger: jest.fn().mockImplementation(() => ({
      log: logMock,
      error: errorMock,
      debug: debugMock,
    })),
  };
});

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: jest.fn() },
  })),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('MailServiceImpl', () => {
  let service: MailServiceImpl;
  let configService: jest.Mocked<ConfigService>;
  let resendMock: any;

  beforeEach(() => {
    jest.clearAllMocks();

    configService = {
      getOrThrow: jest.fn().mockReturnValue('fake-api-key'),
    } as any;

    service = new MailServiceImpl(configService);

    resendMock = (Resend as jest.Mock).mock.results[0].value;
  });

  it('should call resend.emails.send with the right params', async () => {
    // Arrange
    const dto: SendMailDTO = {
      to: 'user@test.com',
      subject: 'Hello',
      html: '<p>World</p>',
    };
    resendMock.emails.send.mockResolvedValue({});

    // Act
    await service.sendMail(dto);

    // Assert
    expect(configService.getOrThrow).toHaveBeenCalledWith('RESEND_API_KEY');
    expect(logMock).toHaveBeenCalledWith('Sending to user@test.com');
    expect(resendMock.emails.send).toHaveBeenCalledWith({
      from: 'noibo@mail.sgroupvn.org',
      replyTo: 'noibosgroup@gmail.com',
      to: dto.to,
      subject: dto.subject,
      html: dto.html,
    });
  });

  it('should log error when resend returns an error', async () => {
    // Arrange
    const dto: SendMailDTO = {
      to: 'fail@test.com',
      subject: 'Oops',
      html: '<p>Error</p>',
    };
    resendMock.emails.send.mockResolvedValue({ error: 'failed' });

    // Act
    await service.sendMail(dto);

    // Assert
    expect(errorMock).toHaveBeenCalledWith('failed');
  });
});

describe('LocalMailServiceImpl', () => {
  let service: LocalMailServiceImpl;
  let sendMailMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new LocalMailServiceImpl();

    sendMailMock = jest.fn().mockResolvedValue({});
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  it('should call nodemailer.createTransport and sendMail with the right params', async () => {
    // Arrange
    const dto: SendMailDTO = {
      to: 'local@test.com',
      subject: 'Local Mail',
      html: '<p>Testing</p>',
    };

    // Act
    await service.sendMail(dto);

    // Assert
    expect(debugMock).toHaveBeenCalledWith(
      '[Local] Fake sending to local@test.com',
    );
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: '127.0.0.1',
      port: 1025,
      secure: false,
      auth: { user: 'mail', pass: 'dev' },
    });
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'dev@localhost',
      ...dto,
    });
  });
});
