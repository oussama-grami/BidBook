import { Resolver, Query, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { BooksService } from '../books/books.service';
import {AuthService} from "../auth/auth.service";
import { CommentsService } from '../comments/comments.service';
import{BidsService} from "../bids/bids.service";

@Resolver('Book')
export class BookResolver {
    constructor(
        private readonly bookService: BooksService,
        private readonly userService: AuthService,
        private readonly commentService: CommentsService,
        private readonly bidService: BidsService,
    ) {}

    @Query('viewBooks')
    async viewBooks(
        @Args('limit') limit?: number,
        @Args('offset') offset?: number,
    ) {
        return this.bookService.findAll();
    }

    @Query('bookDetails')
    async bookDetails(@Args('id', { type: () => ID }) id: number) {
        return this.bookService.findOne(id);
    }

    @ResolveField('owner', () => 'User')
    async owner(@Parent() book: any) {
        return this.userService.findOne(book.ownerId); // Assuming your Book entity has ownerId
    }

    @ResolveField('comments', () => '[Comment]')
    async comments(@Parent() book: any) {
        return this.commentService.findByBookId(book.id);
    }

    @ResolveField('bids', () => '[Bid]')
    async bids(@Parent() book: any) {
        return this.bidService.findByBookId(book.id);
    }

    @ResolveField('commentsCount', () => 'Int')
    async commentsCount(@Parent() book: any) {
        const comments = await this.commentService.findByBookId(book.id);
        return comments.length;
    }
}