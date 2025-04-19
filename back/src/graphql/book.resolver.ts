import { Resolver, Query, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { BooksService } from '../books/books.service';
import { AuthService } from "../auth/auth.service";
import { CommentsService } from '../comments/comments.service';
import{BidsService} from "../bids/bids.service";
import {Book} from "../graphql";
import {InternalServerErrorException} from "@nestjs/common";

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
    ): Promise<Book[]> {
        try {
            const books = await this.bookService.findAll(limit, offset);
            return books ? books : [];
        } catch (error) {
            console.error('Error in viewBooks resolver:', error);
            throw new InternalServerErrorException('Failed to fetch books');
        }
    }

    @Query('bookDetails')
    async bookDetails(@Args('id', { type: () => ID }) id: number) {
        return this.bookService.findOne(id);
    }

    @ResolveField('owner', () => 'User')
    async owner(@Parent() book: any) {
        return this.userService.findOne(book.ownerId);
    }

    @ResolveField('comments', () => '[Comment]')
    async comments(@Parent() book: any) {
        return this.commentService.findByBookId(book.id);
    }

    @ResolveField('bids', () => '[Bid]')
    async bids(@Parent() book: any) {
        return this.bidService.findByBookId(book.id);
    }

}