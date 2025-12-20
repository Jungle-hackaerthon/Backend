import { Controller } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // TODO: POST /posts - 게시글 생성
  // @Post()
  // async create(@Body() createPostDto: CreatePostDto) {
  //   return await this.postsService.create(createPostDto);
  // }

  // TODO: GET /posts?roomId=xxx - 특정 방의 게시글 목록
  // @Get()
  // async findByRoom(@Query('roomId') roomId: string) {
  //   return await this.postsService.findByRoom(roomId);
  // }

  // TODO: GET /posts/:id - 게시글 상세
  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return await this.postsService.findOne(id);
  // }

  // TODO: PATCH /posts/:id - 게시글 수정
  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   return await this.postsService.update(id, updatePostDto);
  // }

  // TODO: DELETE /posts/:id - 게시글 삭제
  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   await this.postsService.remove(id);
  //   return { message: 'Post deleted successfully' };
  // }
}
