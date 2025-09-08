import { Message } from '../../../../system/message-queue/message-queue.client';

export type ReminderUserDTO = {
  id: string;
  email: string;
  joinedAt: string;
  debtMonths: number;
};

export const MAIL_REMINDER_TOPIC = 'MAIL_REMINDER';
export interface SendReminderMessage extends Message {
  id: number;
  to: string[];
  debtMonths: number;
}
