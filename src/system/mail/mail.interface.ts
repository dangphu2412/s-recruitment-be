import { createProviderToken } from '../nestjs-extensions';

export const MAIL_SERVICE_TOKEN = createProviderToken('MailService');

export type SendMailDTO = {
  to: string[] | string;
  subject: string;
  html?: string;
};

export interface MailService {
  sendMail(dto: SendMailDTO): Promise<void>;
}
