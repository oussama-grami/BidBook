import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body() body: { amount: number; currency: string }
  ) {
    const paymentIntent = await this.stripeService.createPaymentIntent(
      body.amount,
      body.currency,
    );
    return { clientSecret: paymentIntent.client_secret };
  }

  @Get(':id')
  async getTransactionDetails(@Param('id') id: number) {
    return this.stripeService.getTransactionDetails(id);
  }

  @Patch('transaction/:id/status')
    async updateTransactionStatus(
        @Param('id') id: number,
        @Body() body: { status: 'succeeded' | 'failed' }
    ) {
        return this.stripeService.updateTransactionStatus(id, body.status);
    }
  


  @Post()
  create(@Body() createStripeDto: CreateStripeDto) {
    return this.stripeService.create(createStripeDto);
  }

  @Get()
  findAll() {
    return this.stripeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stripeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStripeDto: UpdateStripeDto) {
    return this.stripeService.update(+id, updateStripeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stripeService.remove(+id);
  }
}
