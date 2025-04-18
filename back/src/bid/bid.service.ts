import { Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BidService {
  create(createBidDto: CreateBidDto) {
    return 'This action adds a new bid';
  }

  findAll() {
    return `This action returns all bid`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bid`;
  }

  update(id: number, updateBidDto: UpdateBidDto) {
    return `This action updates a #${id} bid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
  /**
   * 
   * @param id the id of the updated bid
   * @param status the new status of the bid
   * @returns 
   */
  async updateBidStatus(id: string, status: string) {
    const bid = await this.bidRepository.findOne({ where: { id } });

    if (status === 'won' && !bid.conversation) {
      const conversation = this.conversationRepository.create({
        isActive: true,
        bid, // Links the conversation to the bid
      });
      await this.conversationRepository.save(conversation);

      bid.conversation = conversation;
      await this.bidRepository.save(bid);
    }

    // Update other bid properties...
    return this.bidRepository.save({ ...bid, status });
  }
}
