import { Injectable } from '@nestjs/common';
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