import { Injectable, OnModuleInit, SetMetadata } from '@nestjs/common';
import { BrokerService } from './message-broker';
import { DiscoveryService, Reflector } from '@nestjs/core';

export const TOPIC_METADATA = 'TOPIC_METADATA';
export interface TopicConfig {
  topic: string;
  // messages in miliseconds
  rate?: number;
}
export function Topic(
  topic: string,
  config: Omit<TopicConfig, 'topic'> = {},
): ClassDecorator {
  return SetMetadata(TOPIC_METADATA, { topic, ...config });
}

@Injectable()
export class TopicExplorer implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly broker: BrokerService,
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders();

    providers.forEach((wrapper) => {
      const instance = wrapper.instance;
      if (!instance) return;

      const config = this.reflector.get<TopicConfig>(
        TOPIC_METADATA,
        instance.constructor,
      );

      if (config) {
        const { topic, rate = Infinity } = config;

        if (typeof instance.consume !== 'function') {
          throw new Error(
            `${instance.constructor.name} must implement consume(topic, message)`,
          );
        }

        this.broker.subscribe(topic, (msg) => instance.consume(msg), rate);
      }
    });
  }
}
