import { BrokerService } from '../../../src/system/message-queue/message-broker';
import {
  Message,
  MessageQueueClient,
} from '../../../src/system/message-queue/message-queue.client';
import { Test } from '@nestjs/testing';

describe('MessageQueueClient', () => {
  let broker: jest.Mocked<BrokerService>;
  let client: MessageQueueClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MessageQueueClient,
        {
          provide: BrokerService,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    client = moduleRef.get(MessageQueueClient);
    broker = moduleRef.get(BrokerService);

    jest.clearAllMocks();
  });

  it('should call broker.publish with topic and message', () => {
    const topic = 'chat';
    const message: Message = { id: '1', user: 'alice', text: 'hi' };

    client.emit(topic, message);

    expect(broker.publish).toHaveBeenCalledTimes(1);
    expect(broker.publish).toHaveBeenCalledWith(topic, message);
  });
});
