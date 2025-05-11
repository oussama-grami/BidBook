import { PartialType } from '@nestjs/swagger';
import { CreateBidDto } from './create-bid.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { BidStatus } from 'src/Enums/bidstatus.enum';

export class UpdateBidDto extends PartialType(CreateBidDto) {
  @IsOptional()
  @IsEnum(BidStatus)
  bidStatus?: BidStatus;
}