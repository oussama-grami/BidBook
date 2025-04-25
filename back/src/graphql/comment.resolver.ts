import { Resolver, Mutation, Query, Args, Int, Subscription, ResolveField, Parent, Context } from '@nestjs/graphql';
import { CommentsService } from "../comments/comments.service"
import { Comment } from '../graphql';
import { InternalServerErrorException, NotFoundException, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Book } from 'src/graphql';
import { AuthService } from 'src/auth/auth.service'; // Import UserService
import { GqlAuthGuard } from 'src/auth/guards/gql.guard';

const pubSub = new PubSub();

@Resolver('Comment')
export class CommentsResolver {
  constructor(
      private readonly commentsService: CommentsService,
      private readonly userService: AuthService,
  ) {}
 
  @UseGuards(GqlAuthGuard)
@Mutation('addCommentToBook')
async addCommentToBook(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Args('content') content: string,
    @Context() context: any
): Promise<Comment> {
    const user = context.req.user;

    if (!user) {
        throw new Error('Utilisateur non authentifié');
    }

    const userId = user.id;

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
  async user(@Parent() comment: any) { // Type 'any' laissé comme dans votre code original
    try {
      // Ligne modifiée pour utiliser la condition where { id: comment.userId }
      // ATTENTION : Ceci ne corrige PAS l'erreur si comment.userId est undefined/null
      return await this.userService.findOne({ where: { id: comment.userId } }); // <-- LIGNE CHANGÉE

    } catch (error) {
      // Ce bloc catch attrapera l'erreur si comment.userId est undefined/null
      console.error('Error fetching user for comment:', error);
      return null;
    }
  }

  @ResolveField('book', () => 'Book')
  async book(@Parent() comment: Comment) {

    return { id: comment.book.id };
  }
}