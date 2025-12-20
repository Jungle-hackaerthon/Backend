import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  // TODO: 게시글 생성
  // async create(createPostDto: CreatePostDto): Promise<Post> {
  //   const post = this.postRepository.create(createPostDto);
  //   return await this.postRepository.save(post);
  // }

  // TODO: 특정 방의 게시글 목록 조회
  // async findByRoom(roomId: string): Promise<Post[]> {
  //   return await this.postRepository.find({
  //     where: { roomId },
  //     order: { createdAt: 'DESC' },
  //   });
  // }

  // TODO: 게시글 상세 조회
  // async findOne(id: string): Promise<Post> {
  //   const post = await this.postRepository.findOne({ where: { id } });
  //   if (!post) {
  //     throw new NotFoundException(`Post with ID ${id} not found`);
  //   }
  //   return post;
  // }

  // TODO: 게시글 수정
  // async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
  //   await this.postRepository.update(id, updatePostDto);
  //   return this.findOne(id);
  // }

  // TODO: 게시글 삭제
  // async remove(id: string): Promise<void> {
  //   await this.postRepository.delete(id);
  // }
}
