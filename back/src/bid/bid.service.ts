import { Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Bid } from 'src/bid/entities/bid.entity';
import { BidStatus } from 'src/Enums/bidstatus.enum';


@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
    private eventEmitter: EventEmitter2,
  ) {}

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
   * Updates the status of a bid and emits appropriate events
   * @param id The id of the bid to update
   * @param status The new status (must be a valid BidStatus value)
   * @returns The updated bid
   */
  async updateBidStatus(id: number, status: BidStatus) {
    const bid = await this.bidRepository.findOne({ 
      where: { id },
      relations: ['conversation', 'bidder']
    });

    if (!bid) {
      throw new Error('Bid not found');
    }

    // Validate the status
    if (!Object.values(BidStatus).includes(status)) {
      throw new Error('Invalid bid status');
    }

    // Handle status changes
    if (status === BidStatus.WON && !bid.conversation) {
      this.eventEmitter.emit('bid.won', { bid });
    }
    else if (status === BidStatus.LOST && bid.conversation?.isActive) {
      this.eventEmitter.emit('bid.lost', { bid });
    }

    // Update bid status using the enum
    bid.bidStatus = status;
    return this.bidRepository.save(bid);
  }

  /**
   * Helper method to get all possible bid statuses
   */
  getBidStatuses(): Record<string, string> {
    return BidStatus;
  }
}