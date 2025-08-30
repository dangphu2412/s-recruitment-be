import { Injectable, Logger } from '@nestjs/common';
import { MessageConsumer } from './message-consumer';
import { Message } from './message-queue.client';

type Handler = MessageConsumer<Message>['consume'];
type ConsumerConfig = {
  handler: Handler;
  rate: number; // messages per second
  queue: any[];
  processing: boolean;
};

@Injectable()
export class BrokerService {
  private topics: Map<string, ConsumerConfig[]> = new Map();

  subscribe(topic: string, handler: Handler, rate: number) {
    Logger.log(`[BrokerService] topic: ${topic}`);
    if (!this.topics.has(topic)) {
      this.topics.set(topic, []);
    }
    this.topics.get(topic)!.push({
      handler,
      rate,
      queue: [],
      processing: false,
    });
  }

  publish(topic: string, message: any) {
    const consumers = this.topics.get(topic) || [];

    for (const consumer of consumers) {
      consumer.queue.push(message);
      this.scheduleProcessing(consumer);
    }
  }

  private scheduleProcessing(consumer: ConsumerConfig) {
    if (consumer.processing) {
      return;
    }

    consumer.processing = true;

    const interval = consumer.rate; // ms between messages
    const loop = async () => {
      const msg = consumer.queue.shift();

      if (msg) {
        try {
          await consumer.handler(msg);
        } catch (err) {
          console.error('[Broker] error processing message', err);
        }
        setTimeout(loop, interval);
      } else {
        consumer.processing = false;
      }
    };

    loop();
  }
}
