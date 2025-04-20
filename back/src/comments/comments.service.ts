import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../comments/entities/comment.entity'; // Assuming your Comment entity is here
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
      @InjectRepository(Comment)
      private readonly commentRepository: Repository<Comment>,
  ) {}
  async addCommentToBook(bookId: number, userId: number, content: string): Promise<Comment> {
    if (!content || content.trim().length === 0) {
        throw new BadRequestException('Comment content cannot be empty.');
    }

    const newComment = this.commentRepository.create({
        content: content,
        user:  { id: userId }  , 
        book: { id:bookId} ,
    });

    return this.commentRepository.save(newComment);
}

async removeComment(commentId: number): Promise<boolean> {
  const comment = await this.commentRepository.findOne({
      where: { id: commentId },
  });

  if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
  }

  await this.commentRepository.remove(comment);

  return true;
}

  async findCommentById(commentId: number): Promise<Comment | null> {
    return await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });
  }

  async findCommentsByBook(bookId: number): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { book: { id: bookId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
  create(createCommentDto: CreateCommentDto) {
    return 'This action adds a new comment';
  }

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }

  async findByBookId(bookId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { book: { id: bookId } },
      relations: ['user'],
    });
  }
}