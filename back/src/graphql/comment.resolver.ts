import { Resolver, Mutation, Query, Args, Int, Subscription, ResolveField, Parent, Context } from '@nestjs/graphql';
import { CommentsService } from "../comments/comments.service"
import { Comment } from '../graphql';
import {UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { AuthService } from '../auth/auth.service';
import { GqlAuthGuard } from '../auth/guards/gql.guard';

const pubSub = new PubSub();

@Resolver('Comment')
export class CommentsResolver {
  constructor(
      private readonly commentsService: CommentsService,
      private readonly userService: AuthService,
  ) {}

@Query('CommentCount')
async commentCount(
  @Args('bookId', { type: () => Int }) bookId: number,
): Promise<number> {
  if (bookId === null || bookId === undefined) {
    throw new Error("Book ID is required to count comments.");
  }

  try {
    const count = await this.commentsService.countByBookId(bookId);
    return count;
  } catch (error) {
    console.error(`Error resolving CommentCount for bookId ${bookId}:`, error);
    throw new Error(`Unable to retrieve the comment count for book ID ${bookId}.`);
  }
}
@Query('GetBookCommentsPaginated')
async getBookCommentsPaginated(
  @Args('bookId') bookId: number,
  @Args('limit', { nullable: true }) limit?: number,
  @Args('offset', { nullable: true }) offset?: number,
): Promise<any[]> {
  console.log(`Resolver received: bookId=${bookId}, limit=${limit}, offset=${offset}`);
  const comments = await this.commentsService.findCommentsByBook(bookId, limit, offset);
  return comments;
}

  @UseGuards(GqlAuthGuard)
@Mutation('addCommentToBook')
async addCommentToBook(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Args('content') content: string,
    @Context() context: any
): Promise<Comment> {
  console.log('addCommentToBook called with:', { bookId, content })
    const user = context.req.user;
    if (!user) {
        throw new Error('User not authenticated');
    }

    const userId = user.id;
    console.log('User ID:', userId);
    const newComment = await this.commentsService.addCommentToBook(bookId, userId, content);
    pubSub.publish('commentAdded', { commentAdded: newComment, bookId });
    return newComment;
}

  @Mutation('removeComment')
  async removeComment(
      @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<boolean> {
    const removedComment = await this.commentsService.removeComment(commentId);
    if (removedComment) {
      const comment = await this.commentsService.findCommentById(commentId);
      if (comment) {
        pubSub.publish('commentRemoved', { commentRemoved: comment.id, bookId: comment.book.id });
        return true;
      }
      return false;
    }
    return false;
  }

  @Subscription('commentAdded', {
    filter: (payload, variables) => payload.bookId === variables.bookId,
  })
  commentAdded(
      @Args('bookId', { type: () => Int }) bookId: number,
  ): AsyncIterator<Comment> {
    return pubSub.asyncIterableIterator('commentAdded');
  }

  @Subscription('commentRemoved', {
    filter: (payload, variables) => payload.bookId === variables.bookId,
  })
  commentRemoved(
      @Args('bookId', { type: () => Int }) bookId: number,
  ): AsyncIterator<number> {
    return pubSub.asyncIterableIterator('commentRemoved');
  }

  @ResolveField('user', () => 'User')
  async user(@Parent() comment: any) {
    try {

      return await this.userService.findOne({ where: { id: comment.userId } });

    } catch (error) {

      console.error('Error fetching user for comment:', error);
      return null;
    }
  }

  @ResolveField('book', () => 'Book')
  async book(@Parent() comment: Comment) {

    return { id: comment.book.id };
  }
}