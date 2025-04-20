import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleDto } from './dto/article.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Article } from './entities/article.entity';

@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {
  }

  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({
    status: 201,
    description: 'Article created',
    type: ArticleDto,
  })
  create(@Body() createArticleDto: CreateArticleDto): Promise<ArticleDto> {
    return this.articleService.create(createArticleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  @ApiResponse({
    status: 200,
    description: 'List of articles',
    type: [ArticleDto],
  })
  findAll(): Promise<ArticleDto[]> {
    return this.articleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an article by ID' })
  @ApiResponse({ status: 200, description: 'Article found', type: ArticleDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  findOne(@Param('id') id: string): Promise<ArticleDto> {
    return this.articleService.findOne(+id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update an article by ID' })
  @ApiResponse({ status: 200, description: 'Article updated', type: Article })
  @ApiResponse({ status: 404, description: 'Article not found' })
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    return this.articleService.update(+id, updateArticleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an article by ID' })
  @ApiResponse({ status: 200, description: 'Article deleted' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.articleService.remove(+id);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Find articles by category' })
  @ApiResponse({
    status: 200,
    description: 'Articles with given category',
    type: [Article],
  })
  findByCategory(@Param('category') category: string): Promise<Article[]> {
    return this.articleService.findByCategory(category);
  }
}
