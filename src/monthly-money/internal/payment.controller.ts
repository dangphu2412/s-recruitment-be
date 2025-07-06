import { Controller, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CanAccessBy } from '../../account-service/account-service.package';
import { Permissions } from '../../account-service/authorization/access-definition.constant';
import { CurrentUser } from '../../account-service/management/user.decorator';

@Controller({
  version: '1',
  path: 'payments',
})
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @CanAccessBy(Permissions.READ_PAYMENTS)
  @Get()
  findMyPayments(@CurrentUser('sub') userId: string) {
    return this.paymentService.findMyPayments(userId);
  }
}
