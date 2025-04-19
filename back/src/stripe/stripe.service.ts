import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-03-31.basil', // Updated to latest Stripe API version
    });
  }
  
  async createPaymentIntent(amount: number, customerId: string, currency = 'usd') {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

}