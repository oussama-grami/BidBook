import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from 'src/stripe/stripe.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { amount: number; customerId: string }) {
    const { amount, customerId } = body;
    return this.stripeService.createPaymentIntent(amount, customerId);
  }

}