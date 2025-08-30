import { Module } from '@nestjs/common';
import { MessageQueueClient } from './message-queue.client';
import { TopicExplorer } from './topic-explorer';
import { BrokerService } from './message-broker';
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [DiscoveryModule],
  providers: [MessageQueueClient, TopicExplorer, BrokerService],
  exports: [MessageQueueClient],
})
export class MessageQueueModule {}
