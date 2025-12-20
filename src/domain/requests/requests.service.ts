import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestResponse } from './entities/request-response.entity';
import { Request, RequestStatus } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { CreateResponseDto } from './dto/create-response.dto';
import { QueryRequestsDto } from './dto/query-requests.dto';
import { User } from '../users/user.entity';
import { MapGateway } from '../map/map.gateway';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(RequestResponse)
    private readonly requestResponsesRepository: Repository<RequestResponse>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => MapGateway))
    private readonly mapGateway: MapGateway,
  ) {}

  async create(userId: string, dto: CreateRequestDto): Promise<Request> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const price = dto.proposedPrice ?? 100;
    if (user.pointBalance < price) {
      throw new BadRequestException(
        `포인트가 부족합니다. (보유: ${user.pointBalance}, 필요: ${price})`,
      );
    }

    // 포인트 차감 (홀드)
    user.pointBalance -= price;
    await this.usersRepository.save(user);

    // merchantName 생성 (간단하게 카운터 사용)
    const count = await this.requestsRepository.count({
      where: { requester: { id: userId } },
    });
    const merchantName = `${user.nickname}_${count}`;

    // 마감 시간 설정 (10분 후)
    const deadline = new Date();
    deadline.setMinutes(deadline.getMinutes() + 10);

    const request = this.requestsRepository.create({
      requester: user,
      merchantName,
      title: dto.title,
      description: dto.description,
      proposedPrice: price,
      mapId: dto.mapId,
      xPosition: dto.xPosition,
      yPosition: dto.yPosition,
      deadline,
      status: RequestStatus.IN_PROGRESS,
    });

    const saved = await this.requestsRepository.save(request);

    // 소켓 브로드캐스트
    this.mapGateway.emitRequestCreated(saved.mapId, this.formatRequest(saved));

    return saved;
  }

  async findAll(query: QueryRequestsDto) {
    const { mapId, status, page = 1, limit = 20 } = query;

    const qb = this.requestsRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.requester', 'requester')
      .leftJoin('request_responses', 'response', 'response.request_id = request.id')
      .addSelect('COUNT(response.id)', 'responseCount')
      .groupBy('request.id')
      .addGroupBy('requester.id');

    if (mapId !== undefined) {
      qb.andWhere('request.mapId = :mapId', { mapId });
    }

    if (status) {
      qb.andWhere('request.status = :status', { status });
    }

    qb.orderBy('request.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [requests, total] = await qb.getManyAndCount();

    return {
      requests: requests.map((req) => this.formatRequestList(req)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: ['requester'],
    });

    if (!request) {
      throw new NotFoundException('존재하지 않는 요청입니다.');
    }

    const responses = await this.requestResponsesRepository.find({
      where: { request: { id } },
      relations: ['helper'],
      order: { createdAt: 'ASC' },
    });

    const selectedResponse = request.selectedResponseId
      ? responses.find((r) => r.id === request.selectedResponseId)
      : null;

    return {
      ...this.formatRequest(request),
      responses: responses.map((r) => this.formatResponse(r)),
      selectedResponse: selectedResponse ? this.formatResponse(selectedResponse) : null,
    };
  }

  async cancel(id: string, userId: string) {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: ['requester'],
    });

    if (!request) {
      throw new NotFoundException('존재하지 않는 요청입니다.');
    }

    if (request.requester.id !== userId) {
      throw new ForbiddenException('본인의 요청만 취소할 수 있습니다.');
    }

    if (request.status !== RequestStatus.IN_PROGRESS) {
      throw new BadRequestException('이미 완료되었거나 취소된 요청입니다.');
    }

    // 포인트 환불
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (user) {
      user.pointBalance += request.proposedPrice;
      await this.usersRepository.save(user);
    }

    request.status = RequestStatus.CANCELLED;
    await this.requestsRepository.save(request);

    // 소켓 브로드캐스트
    this.mapGateway.emitRequestDeleted(request.mapId, request.id);
  }

  async createResponse(requestId: string, userId: string, dto: CreateResponseDto) {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
      relations: ['requester'],
    });

    if (!request) {
      throw new NotFoundException('존재하지 않는 요청입니다.');
    }

    if (request.requester.id === userId) {
      throw new BadRequestException('본인의 요청에는 응찰할 수 없습니다.');
    }

    if (request.status !== RequestStatus.IN_PROGRESS) {
      throw new BadRequestException('마감된 요청입니다.');
    }

    // 이미 응찰했는지 확인
    const existing = await this.requestResponsesRepository.findOne({
      where: { request: { id: requestId }, helper: { id: userId } },
    });

    if (existing) {
      throw new BadRequestException('이미 응찰한 요청입니다.');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const response = this.requestResponsesRepository.create({
      request,
      helper: user,
      proposedPrice: dto.proposedPrice ?? request.proposedPrice,
    });

    const saved = await this.requestResponsesRepository.save(response);

    return this.formatResponse(saved);
  }

  async findResponses(requestId: string) {
    const responses = await this.requestResponsesRepository.find({
      where: { request: { id: requestId } },
      relations: ['helper'],
      order: { createdAt: 'ASC' },
    });

    return responses.map((r) => this.formatResponse(r));
  }

  async selectHelper(requestId: string, responseId: string, userId: string) {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
      relations: ['requester'],
    });

    if (!request) {
      throw new NotFoundException('존재하지 않는 요청입니다.');
    }

    if (request.requester.id !== userId) {
      throw new ForbiddenException('본인의 요청만 도우미를 선택할 수 있습니다.');
    }

    const response = await this.requestResponsesRepository.findOne({
      where: { id: responseId, request: { id: requestId } },
      relations: ['helper'],
    });

    if (!response) {
      throw new NotFoundException('존재하지 않는 응찰입니다.');
    }

    request.selectedResponseId = responseId;
    await this.requestsRepository.save(request);

    return {
      selectedResponse: this.formatResponse(response),
    };
  }

  async complete(requestId: string, userId: string) {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
      relations: ['requester'],
    });

    if (!request) {
      throw new NotFoundException('존재하지 않는 요청입니다.');
    }

    if (request.requester.id !== userId) {
      throw new ForbiddenException('본인의 요청만 완료 처리할 수 있습니다.');
    }

    if (!request.selectedResponseId) {
      throw new BadRequestException('먼저 도우미를 선택해주세요.');
    }

    const selectedResponse = await this.requestResponsesRepository.findOne({
      where: { id: request.selectedResponseId },
      relations: ['helper'],
    });

    if (!selectedResponse) {
      throw new NotFoundException('선택된 도우미를 찾을 수 없습니다.');
    }

    // 포인트 전송
    const helper = selectedResponse.helper;
    const amount = selectedResponse.proposedPrice ?? request.proposedPrice;
    helper.pointBalance += amount;
    await this.usersRepository.save(helper);

    request.status = RequestStatus.COMPLETED;
    await this.requestsRepository.save(request);

    // 소켓 브로드캐스트
    this.mapGateway.emitRequestDeleted(request.mapId, request.id);

    return {
      request: {
        id: request.id,
        status: request.status,
      },
      pointTransfer: {
        from: userId,
        to: helper.id,
        amount,
      },
    };
  }

  private formatRequest(request: Request) {
    return {
      id: request.id,
      requester: {
        id: request.requester.id,
        nickname: request.requester.nickname,
      },
      merchantName: request.merchantName,
      title: request.title,
      description: request.description,
      proposedPrice: request.proposedPrice,
      mapId: request.mapId,
      xPosition: request.xPosition,
      yPosition: request.yPosition,
      deadline: request.deadline?.toISOString(),
      status: request.status,
      createdAt: request.createdAt.toISOString(),
    };
  }

  private formatRequestList(request: Request & { responseCount?: number }) {
    return {
      id: request.id,
      requester: {
        id: request.requester.id,
        nickname: request.requester.nickname,
      },
      merchantName: request.merchantName,
      title: request.title,
      proposedPrice: request.proposedPrice,
      mapId: request.mapId,
      xPosition: request.xPosition,
      yPosition: request.yPosition,
      deadline: request.deadline?.toISOString(),
      status: request.status,
      responseCount: request.responseCount ?? 0,
      createdAt: request.createdAt.toISOString(),
    };
  }

  private formatResponse(response: RequestResponse) {
    return {
      id: response.id,
      helper: {
        id: response.helper.id,
        nickname: response.helper.nickname,
      },
      proposedPrice: response.proposedPrice,
      status: response.status ?? null,
      createdAt: response.createdAt.toISOString(),
    };
  }
}
