import { Resolver, Query, Args, ID, ResolveField, Parent, Int, Mutation, Float } from '@nestjs/graphql';
import { BooksService } from '../books/books.service';
import {AuthService} from "../auth/auth.service";
import{BidsService} from "../bids/bids.service";
import { Bid } from 'src/graphql';
import { InternalServerErrorException } from '@nestjs/common';


@Resolver('Bid')
export class BidResolver {
    constructor(
        private readonly bidService: BidsService,
        private readonly userService: AuthService,
        private readonly bookService: BooksService,
    ) {}

    @Query('myBids')
    async myBids(
        @Args('limit') limit?: number,
        @Args('offset') offset?: number,
    ) {
        const userId = 2 // Replace with actual user ID
        try {
            return await this.bidService.findBidsByUser(userId, { limit, offset });
        } catch (error) {
            console.error('Error fetching user bids:', error);
            throw new InternalServerErrorException('Failed to fetch bids');
        }
    }


    @Query('highestBidForBook')
    async highestBidForBook(
        @Args('bookId', { type: () => Int }) bookId: number,
    ): Promise<Bid | null> {
        return this.bidService.findHighestBidForBook(bookId);
    }
  
    
    @Mutation('createBid')
    async  createBid(
        @Args('userId', { type: () => Int }) userId: number, 
        @Args('bookId', { type: () => Int }) bookId: number,
        @Args('amount', { type: () => Float }) amount: number,
        
    ): Promise<Bid> {
        try {
            return await this.bidService.createBid(userId, bookId, amount);
        } catch (error) {
            console.error(`Error in createBid mutation (userId: ${userId}, bookId: ${bookId}, amount: ${amount}):`, error);
            throw new InternalServerErrorException('Failed to create bid');
        }
    }


@Mutation('updateBid')
async updateBid(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Args('userId', { type: () => Int }) userId: number,
    @Args('amount', { type: () => Float }) amount: number,
): Promise<Bid> {
    return this.bidService.updateBid(userId, bookId, amount);
}
    


}