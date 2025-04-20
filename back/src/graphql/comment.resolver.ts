import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { CommentsService } from "../comments/comments.service"
import { Comment } from '../graphql';
import { InternalServerErrorException } from '@nestjs/common';

@Resolver('Comment')
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Mutation('addCommentToBook') 
  async addCommentToBook(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Args('userId', { type: () => Int }) userId: number,
    @Args('content') content: string, 
  ): Promise<Comment> {
    return this.commentsService.addCommentToBook(bookId, userId, content);
  }

  @Mutation('removeComment')
  async removeComment(
    @Args('commentId', { type: () => Int }) commentId: number, 
  ): Promise<boolean> {
    return this.commentsService.removeComment(commentId);
  }

  
}