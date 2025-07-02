import { Injectable, Logger } from '@nestjs/common';
import { MailService, SendMailDTO } from './mail.interface';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailServiceImpl implements MailService {
  private resend: Resend;
  private logger = new Logger(MailServiceImpl.name);

  constructor(configService: ConfigService) {
    const apiKey = configService.getOrThrow<string>('RESEND_API_KEY');

    this.resend = new Resend(apiKey);
  }

  async sendMail(dto: SendMailDTO) {
    const response = await this.resend.emails.send({
      from: 'noibo@mail.sgroupvn.org',
      to: dto.to,
      replyTo: 'noibosgroup@gmail.com',
      subject: dto.subject,
      text: dto.text,
    });

    if (response.error) {
      this.logger.error(response.error);
    }
  }
}
