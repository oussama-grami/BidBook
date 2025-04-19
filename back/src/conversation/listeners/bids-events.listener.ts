import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConversationService } from '../conversation.service';
import { Bid } from 'src/bid/entities/bid.entity';

@Injectable()
export class BidEventsListener {
  constructor(
    private conversationService: ConversationService
  ) {}

  @OnEvent('bid.won')
  async handleBidWon({ bid }: { bid: Bid }) {
    // Create conversation when bid is won
    await this.conversationService.createBidConversation(bid);
  }

  @OnEvent('bid.lost')
  async handleBidLost({ bid }: { bid: Bid }) {
    const conversation = await this.conversationService.findByBidId(bid.id);
    if (conversation) {
      await this.conversationService.setConversationStatus(conversation.id, false);
    }
  }
}