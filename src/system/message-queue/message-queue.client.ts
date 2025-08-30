import { Injectable } from '@nestjs/common';
import { BrokerService } from './message-broker';

/**
 * A base shape for all messages.
 *
 * - Each message must have a unique `id` field.
 * - Other arbitrary key/value pairs can be attached.
 */
export type Message = {
  id: PropertyKey;
  [key: string]: unknown;
};

/**
 * MessageQueueClient
 * ------------------
 * Provides a simple way to publish messages to a given topic.
 *
 * Works together with `BrokerService`, which manages the in-memory
 * pub/sub system and dispatches messages to subscribed consumers.
 */
@Injectable()
export class MessageQueueClient {
  constructor(private readonly broker: BrokerService) {}

  /**
   * Emit a message to a specific topic.
   *
   * @param topic - The name of the topic (string identifier).
   * @param message - The payload to publish.
   *
   * Example:
   *   client.emit('chat', { id: '1', user: 'alice', text: 'hi' })
   */
  emit<M extends Message>(topic: string, message: M): void {
    this.broker.publish(topic, message);
  }
}
