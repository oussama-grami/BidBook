import { IsInt, IsPositive } from 'class-validator';

export class CreateBidDto {
    @IsInt()
    userId: number;

    @IsInt()
    bookId: number;

    @IsPositive()
    amount: number;
}
