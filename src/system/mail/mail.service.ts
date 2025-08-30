import { Injectable, Logger } from '@nestjs/common';
import { MailService, SendMailDTO } from './mail.interface';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

@Injectable()
export class MailServiceImpl implements MailService {
  private resend: Resend;
  private logger = new Logger(MailServiceImpl.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');

    this.resend = new Resend(apiKey);
  }

  async sendMail(dto: SendMailDTO) {
    this.logger.log(`Sending to ${dto.to}`);
    const response = await this.resend.emails.send({
      from: 'noibo@mail.sgroupvn.org',
      replyTo: 'noibosgroup@gmail.com',
      to: dto.to,
      subject: dto.subject,
      html: dto.html,
    });

    if (response.error) {
      this.logger.error(response.error);
    }
  }
}

@Injectable()
export class LocalMailServiceImpl implements MailService {
  private logger = new Logger(LocalMailServiceImpl.name);

  async sendMail(dto: SendMailDTO) {
    this.logger.debug(`[Local] Fake sending to ${dto.to}`);
    const transporter = nodemailer.createTransport({
      host: '127.0.0.1',
      port: 1025,
      secure: false,
      auth: {
        user: 'mail',
        pass: 'dev',
      },
    });

    await transporter.sendMail({
      from: 'dev@localhost',
      ...dto,
    });
  }
}
