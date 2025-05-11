import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';
import { Bid } from '../bids/entities/bid.entity';

@Injectable()
export class ConversationService {

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
  ) {}
  create(createConversationDto: CreateConversationDto) {
    return 'This action adds a new conversation';
  }

  async createConversation(bidId: number): Promise<Conversation> {
    const bid = await this.bidRepository.findOne({ where: { id: bidId } });
    if (!bid) {
      throw new BadRequestException(`Bid with ID ${bidId} not found.`);
    }

    const conversation = this.conversationRepository.create({
      isActive: true,
      startDate: new Date(),
      bid: { id: bidId },
    });

    return await this.conversationRepository.save(conversation);
  }

  findAll() {
    return `This action returns all conversation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} conversation`;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
