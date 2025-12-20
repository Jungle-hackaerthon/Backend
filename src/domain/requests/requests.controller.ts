import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { CreateResponseDto } from './dto/create-response.dto';
import { QueryRequestsDto } from './dto/query-requests.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateRequestDto) {
    const userId = req.user.id;
    const request = await this.requestsService.create(userId, dto);

    return {
      success: true,
      message: '요청이 생성되었습니다.',
      data: request,
    };
  }

  @Get()
  async findAll(@Query() query: QueryRequestsDto) {
    const result = await this.requestsService.findAll(query);

    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const request = await this.requestsService.findOne(id);

    return {
      success: true,
      data: request,
    };
  }

  @Delete(':id')
  async cancel(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    await this.requestsService.cancel(id, userId);

    return {
      success: true,
      message: '요청이 취소되었습니다.',
    };
  }

  @Post(':id/responses')
  async createResponse(
    @Request() req,
    @Param('id') requestId: string,
    @Body() dto: CreateResponseDto,
  ) {
    const userId = req.user.id;
    const response = await this.requestsService.createResponse(
      requestId,
      userId,
      dto,
    );

    return {
      success: true,
      message: '응찰되었습니다.',
      data: response,
    };
  }

  @Get(':id/responses')
  async findResponses(@Param('id') requestId: string) {
    const responses = await this.requestsService.findResponses(requestId);

    return {
      success: true,
      data: {
        responses,
      },
    };
  }

  @Post(':id/select/:responseId')
  async selectHelper(
    @Request() req,
    @Param('id') requestId: string,
    @Param('responseId') responseId: string,
  ) {
    const userId = req.user.id;
    const result = await this.requestsService.selectHelper(
      requestId,
      responseId,
      userId,
    );

    return {
      success: true,
      message: '도우미가 선택되었습니다.',
      data: result,
    };
  }

  @Post(':id/complete')
  async complete(@Request() req, @Param('id') requestId: string) {
    const userId = req.user.id;
    const result = await this.requestsService.complete(requestId, userId);

    return {
      success: true,
      message: `요청이 완료되었습니다. ${result.pointTransfer.amount} 포인트가 전송되었습니다.`,
      data: result,
    };
  }
}
