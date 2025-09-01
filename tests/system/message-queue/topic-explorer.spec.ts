// topic-explorer.spec.ts
import { Reflector } from '@nestjs/core';
import { DiscoveryService } from '@nestjs/core/discovery/discovery-service';
import { BrokerService } from '../../../src/system/message-queue/message-broker';
import {
  TopicConfig,
  TopicExplorer,
} from '../../../src/system/message-queue/topic-explorer';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

describe('TopicExplorer (AAA)', () => {
  let discoveryService: jest.Mocked<DiscoveryService>;
  let reflector: jest.Mocked<Reflector>;
  let broker: jest.Mocked<BrokerService>;
  let explorer: TopicExplorer;

  beforeEach(() => {
    discoveryService = {
      getProviders: jest.fn(),
    } as unknown as jest.Mocked<DiscoveryService>;

    reflector = {
      get: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    broker = {
      subscribe: jest.fn(),
    } as unknown as jest.Mocked<BrokerService>;

    explorer = new TopicExplorer(discoveryService, reflector, broker);

    jest.clearAllMocks();
  });

  it('should skip providers without instance', () => {
    // Arrange
    jest.spyOn(discoveryService, 'getProviders').mockReturnValue([]);
    discoveryService.getProviders.mockReturnValue([]);

    // Act
    explorer.onModuleInit();

    // Assert
    expect(reflector.get).not.toHaveBeenCalled();
    expect(broker.subscribe).not.toHaveBeenCalled();
  });

  it('should skip providers without topic metadata', () => {
    // Arrange
    class TestConsumer {
      consume() {}
    }
    const wrapper = { instance: new TestConsumer() } as InstanceWrapper;
    discoveryService.getProviders.mockReturnValue([wrapper]);
    reflector.get.mockReturnValue(undefined);

    // Act
    explorer.onModuleInit();

    // Assert
    expect(broker.subscribe).not.toHaveBeenCalled();
  });

  it('should subscribe provider with topic metadata and consume method', () => {
    // Arrange
    class TestConsumer {
      consume() {}
    }
    const wrapper = { instance: new TestConsumer() };
    const config: TopicConfig = { topic: 'orders', rate: 5000 };

    discoveryService.getProviders.mockReturnValue([wrapper as InstanceWrapper]);
    reflector.get.mockReturnValue(config);

    // Act
    explorer.onModuleInit();

    // Assert
    expect(broker.subscribe).toHaveBeenCalledWith(
      'orders',
      expect.any(Function),
      5000,
    );
  });

  it('should throw error if provider does not implement consume', () => {
    // Arrange
    class InvalidConsumer {}
    const wrapper = { instance: new InvalidConsumer() } as InstanceWrapper;
    const config: TopicConfig = { topic: 'users' };

    discoveryService.getProviders.mockReturnValue([wrapper]);
    reflector.get.mockReturnValue(config);

    // Act + Assert
    expect(() => explorer.onModuleInit()).toThrow(
      'InvalidConsumer must implement consume(topic, message)',
    );
  });

  it('should use Infinity as default rate', () => {
    // Arrange
    class TestConsumer {
      consume() {}
    }
    const wrapper = { instance: new TestConsumer() } as InstanceWrapper;
    const config: TopicConfig = { topic: 'payments' }; // no rate

    discoveryService.getProviders.mockReturnValue([wrapper]);
    reflector.get.mockReturnValue(config);

    // Act
    explorer.onModuleInit();

    // Assert
    expect(broker.subscribe).toHaveBeenCalledWith(
      'payments',
      expect.any(Function),
      Infinity,
    );
  });
});
