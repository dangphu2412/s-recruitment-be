import { BrokerService } from '../../../src/system/message-queue/message-broker';
import { Test } from '@nestjs/testing';

describe('BrokerService', () => {
  let service: BrokerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [BrokerService],
    }).compile();

    service = moduleRef.get(BrokerService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should call the correct handler of topic', () => {
    const handler = jest.fn();

    service.subscribe('TEST_TOPIC', handler, 0);
    service.publish('TEST_TOPIC', { id: '1', message: 'test' });

    expect(handler).toHaveBeenCalledWith({ id: '1', message: 'test' });
  });

  it('should call multiple handlers of topic', () => {
    const handler = jest.fn();
    const handler2 = jest.fn();

    service.subscribe('TEST_TOPIC', handler, Infinity);
    service.subscribe('TEST_TOPIC', handler2, Infinity);
    service.publish('TEST_TOPIC', { id: '1', message: 'test' });

    expect(handler).toHaveBeenCalledWith({ id: '1', message: 'test' });
    expect(handler2).toHaveBeenCalledWith({ id: '1', message: 'test' });
  });
});
