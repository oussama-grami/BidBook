import { Resolver, Query, Args, ID, ResolveField, Parent, Mutation, Int } from '@nestjs/graphql';
import { BooksService } from '../books/books.service';
import { AuthService } from "../auth/auth.service";
import { CommentsService } from '../comments/comments.service';
import{BidsService} from "../bids/bids.service";
import {Book} from "../graphql";
import {BadRequestException, InternalServerErrorException, NotFoundException, UseGuards} from "@nestjs/common";
import { GqlAuthGuard } from 'src/auth/guards/gql.guard';
import { User } from 'src/Decorator/user.decorator';
;
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

    @Query('book')
    async getBook(@Args('id', { type: () => Int }) id: number): Promise<Book | null> {
        try {
            const book = await this.bookService.findOne(id);
            if (!book) {
                throw new NotFoundException(`Book with ID ${id} not found`);
            }
            return book;
        } catch (error) {
            console.error(`Error fetching book with ID ${id}:`, error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to fetch book with ID ${id}`);
        }
    }

    @ResolveField('owner', () => 'User')
    async owner(@Parent() book: any) {
        console.log('Book object in owner resolver:', book);
        console.log('book.ownerId:', book.ownerId);
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