import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReferenceType } from '../entities/chat-room.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The ID of the user to start a chat with',
    example: 'user-uuid-5678',
  })
  targetUserId: string;

  @IsOptional()
  @IsEnum(ReferenceType)
  @ApiProperty({
    description: 'The type of entity this chat is related to',
    enum: ReferenceType,
    required: false,
  })
  referenceType: ReferenceType;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The ID of the entity this chat is related to',
    example: 'product-uuid-1234',
    required: false,
  })
  referenceId: string;
}
