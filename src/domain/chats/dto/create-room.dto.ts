import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReferenceType } from '../entities/chat-room.entity';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  targetUserId: string;

  @IsOptional()
  @IsEnum(ReferenceType)
  referenceType?: ReferenceType;

  @IsOptional()
  @IsString()
  referenceId?: string;
}
