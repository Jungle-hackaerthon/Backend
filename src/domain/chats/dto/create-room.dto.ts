import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReferenceType } from '../entities/chat-room.entity';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsEnum(ReferenceType)
  referenceType: ReferenceType;

  @IsNotEmpty()
  @IsString()
  referenceId: string;
}
