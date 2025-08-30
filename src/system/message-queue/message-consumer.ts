import { Message } from './message-queue.client';

/**
 * MessageConsumer<M>
 * -------------------
 * A contract that defines how to consume messages of type `M`.
 *
 * @template M - The specific `Message` type this consumer will handle.
 */
export interface MessageConsumer<M extends Message> {
  /**
   * consume(message: M): Promise<void>
   *
   * Called whenever a new message of type `M` is delivered
   * from the message queue or broker.
   *
   * @param message - The message payload to process.
   * @returns A promise that resolves when processing is complete.
   */
  consume(message: M): Promise<void>;
}
