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

/**
 * 요청(Request) 시스템 컨트롤러
 * - 사용자가 부탁을 생성하고, 다른 사용자가 응찰하는 시스템
 * - 모든 엔드포인트는 JWT 인증 필요
 */
@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  /**
   * 요청 생성
   * - 포인트를 차감하고 요청 생성
   * - 같은 맵의 유저들에게 소켓으로 실시간 브로드캐스트
   */
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

  /**
   * 요청 목록 조회
   * - mapId, status로 필터링 가능
   * - 페이지네이션 지원
   */
  @Get()
  async findAll(@Query() query: QueryRequestsDto) {
    const result = await this.requestsService.findAll(query);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 요청 상세 조회
   * - 응찰 목록 및 선택된 응찰 포함
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const request = await this.requestsService.findOne(id);

    return {
      success: true,
      data: request,
    };
  }

  /**
   * 요청 취소
   * - 포인트 환불
   * - 맵에서 제거 (소켓 브로드캐스트)
   */
  @Delete(':id')
  async cancel(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    await this.requestsService.cancel(id, userId);

    return {
      success: true,
      message: '요청이 취소되었습니다.',
    };
  }

  /**
   * 응찰하기
   * - 요청에 응찰 (제안 가격 제시)
   * - 본인 요청에는 응찰 불가
   */
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

  /**
   * 응찰 목록 조회
   * - 특정 요청의 모든 응찰 조회
   */
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

  /**
   * 도우미 선택
   * - 응찰 중 하나를 선택
   * - 요청자만 가능
   */
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

  /**
   * 요청 완료 처리
   * - 포인트를 도우미에게 전송
   * - 맵에서 제거 (소켓 브로드캐스트)
   */
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
