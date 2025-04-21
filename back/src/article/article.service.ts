import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { User } from '../auth/entities/user.entity';
import { ArticleDto } from './dto/article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<ArticleDto> {
    const user = await this.userRepository.findOne({
      where: { id: createArticleDto.authorId },
    });

    if (!user) {
      throw new NotFoundException('Author not found');
    }

    const article = this.articleRepository.create({
      ...createArticleDto,
      author: user,
    });

    const saved = await this.articleRepository.save(article);

    return saved;
  }

  async findAll(): Promise<ArticleDto[]> {
    const articles = await this.articleRepository.find({
      relations: ['author'],
    });
    return articles;
  }

  async findOne(id: number): Promise<ArticleDto> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }

    return article;
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { id } });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    Object.assign(article, updateArticleDto);

    return this.articleRepository.save(article);
  }

  async remove(id: number): Promise<void> {
    const result = await this.articleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
  }

  async findByCategory(category: string): Promise<Article[]> {
    return this.articleRepository.find({
      where: { category },
    });
  }

  // private toArticleDto(article: Article): ArticleDto {
  //   return {
  //     title: article.title,
  //     content: article.content,
  //     category: article.category,
  //     pictureUrl: article.pictureUrl,
  //     author: article.author,
  //   };
  // }
}
