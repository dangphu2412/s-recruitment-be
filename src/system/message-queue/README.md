# In memory message queue

1. What the system is
2. How to define messages
3. How to create consumers with `@Topic()`
4. How to emit messages
5. Example end-to-end flow

---

# 📚 Message Queue (In-Memory Pub/Sub) for NestJS

This package provides a simple **in-memory message broker** with:

* `@Topic()` decorator → auto-register consumers to topics
* `MessageQueueClient` → publish messages
* `MessageConsumer` interface → enforce contract for consumers
* **Rate limiting** → process messages at a controlled rate (e.g. 2 msgs/sec)

Perfect for event-driven communication between services inside your NestJS app.

## 📦 Core Concepts

### Message

Every message must extend the base `Message` type:

```ts
export type Message = {
  id: PropertyKey;           // unique identifier
  [key: string]: unknown;    // additional payload fields
};
```

---

### MessageConsumer Interface

Consumers implement the `MessageConsumer` interface to define how messages are handled:

```ts
import { Message } from './message-queue.client';

export interface MessageConsumer<M extends Message> {
  consume(message: M): Promise<void>;
}
```

---

### MessageQueueClient

Use this service to emit messages to the broker:

```ts
@Injectable()
export class MessageQueueClient {
  constructor(private readonly broker: BrokerService) {}

  emit<M extends Message>(topic: string, message: M): void {
    this.broker.publish(topic, message);
  }
}
```

---

### @Topic Decorator

Registers a consumer with the broker automatically:

```ts
@Topic('chat', { rate: 2 }) // 2 msgs/sec
```

The consumer must implement `MessageConsumer<M>`.

---

## 🧑‍💻 Example Usage

### 1. Define a message type

```ts
// chat-message.ts
import { Message } from './message-queue.client';

export interface ChatMessage extends Message {
  userId: string;
  content: string;
}
```

---

### 2. Create a consumer

```ts
// chat.consumer.ts
import { Injectable } from '@nestjs/common';
import { Topic } from './topic.decorator';
import { MessageConsumer } from './message-consumer.interface';
import { ChatMessage } from './chat-message';

@Injectable()
@Topic('chat', { rate: 2 }) // process max 2 messages per second
export class ChatConsumer implements MessageConsumer<ChatMessage> {
  async consume(message: ChatMessage): Promise<void> {
    console.log(`[Chat] ${message.userId}: ${message.content}`);
  }
}
```

---

### 3. Wire everything in a module

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { BrokerService } from './message-broker';
import { MessageQueueClient } from './message-queue.client';
import { TopicExplorer } from './topic-explorer.provider';
import { ChatConsumer } from './chat.consumer';

@Module({
  providers: [BrokerService, MessageQueueClient, TopicExplorer, ChatConsumer],
  exports: [MessageQueueClient],
})
export class AppModule {}
```

---

### 4. Emit messages from a controller

```ts
// chat.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { MessageQueueClient } from './message-queue.client';
import { ChatMessage } from './chat-message';

@Controller('chat')
export class ChatController {
  constructor(private readonly client: MessageQueueClient) {}

  @Post('send')
  async send(@Body() body: { userId: string; content: string }) {
    const message: ChatMessage = {
      id: Date.now(),
      userId: body.userId,
      content: body.content,
      timestamp: new Date().toISOString(),
    };

    this.client.emit('chat', message);

    return { status: 'sent', message };
  }
}
```

---

## 🌀 End-to-End Flow

1. A client calls `POST /chat/send` with `{ userId, content }`.
2. `MessageQueueClient.emit('chat', message)` publishes the message.
3. The broker enqueues the message for the `chat` topic.
4. `ChatConsumer` (decorated with `@Topic('chat')`) consumes it at a max rate of 2 msgs/sec.

---

## ✅ Key Features

* **Type-safe messages** (`Message` + custom interfaces)
* **Decorators** to register consumers easily
* **Rate limiting** per consumer (`@Topic('x', { rate: 2 })`)
* **In-memory only** → perfect for local dev, POCs, or lightweight internal events
