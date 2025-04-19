import { Resolver, Query, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { BooksService } from '../books/books.service';
import {AuthService} from "../auth/auth.service";
import{BidsService} from "../bids/bids.service";


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
        const userId = 1;
        return this.bidService.findBooksBidByUser(userId, { limit, offset });
    }
}