import {
  Controller,
  Req,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Put,
  UseGuards,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { EventEntity } from './entities/event.entity';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from 'src/aws/aws.s3';

// request에 user 객체를 추가하기 위한 인터페이스
interface RequestWithUser extends Request {
  user: User;
}

@Controller('events')
@ApiTags('Events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  // 이벤트 생성
  @Post()
  @UseGuards(JwtAccessAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: '호스트로 Event 생성' })
  @ApiCreatedResponse({ type: EventEntity })
  create(@Req() req: RequestWithUser, @Body() createEventDto: CreateEventDto) {
    const { userId } = req.user; // request에 user 객체가 추가되었고 userId에 값 할당

    return this.eventsService.create(userId, createEventDto);
  }

  // 이벤트 이미지 업로드
  @Post('upload')
  @UseGuards(JwtAccessAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: 'Event 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    description: 'event image',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(@UploadedFile() file) {
    console.log('file', file);

    const uploadedFile = (await this.awsS3Service.uploadEventFile(file)) as {
      Location: string;
    };
    return {
      message: '이미지가 업로드되었습니다',
      ImgURL: uploadedFile,
    };
  }

  // 이벤트 전체 조회
  @Get()
  @ApiOperation({ summary: 'Event 전체 조회' })
  @ApiOkResponse({ type: EventEntity, isArray: true })
  async findAll() {
    const events = await this.eventsService.findAll();
    const event = events.map((item) => {
      const { GuestEvents, HostEvents, ...rest } = item;
      const hostUser = item.HostEvents[0].User.UserDetail;

      return {
        event: rest,
        guestList: item.GuestEvents.length,
        hostUser: hostUser,
      };
    });
    return event;
  }

  // 이벤트 상세 조회
  @Get(':eventId')
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: 'Event 상세 조회' })
  @ApiOkResponse({ type: EventEntity })
  async findOne(@Req() req: RequestWithUser, @Param('eventId', ParseIntPipe) eventId: number) {
    const {userId} = req.user

    const isJoin = await this.eventsService.isJoin(eventId, userId)
    const confirmJoin = isJoin ? true : false 

    const event = await this.eventsService.findOne(eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);

    await this.eventsService.createViewLog(eventId);

    const { GuestEvents, HostEvents, ...rest } = event;

    return {
      event: rest,
      guestList: event.GuestEvents.length,
      hostUser: HostEvents[0].User.UserDetail,
      guestUser: GuestEvents.map((item)=>{
        return item.User.UserDetail
      }),
      isJoin : confirmJoin
    };
  }

  // 이벤트 참가 신청
  @Put(':eventId/join')
  @UseGuards(JwtAccessAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: 'Guest로서 Event 참가신청' })
  @ApiCreatedResponse({ description: `모임 참석 신청 / 취소` })
  async join(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Req() req: RequestWithUser
  ) {
    const event = await this.eventsService.findOne(eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);

    const { userId } = req.user;

    const isJoin = await this.eventsService.isJoin(eventId, userId);
    if (!isJoin) {
      this.eventsService.join(+eventId, userId);
      this.eventsService.createRsvpLog(eventId, userId, 'applied'); // 참가 신청 로그 생성
      return `${eventId}번 모임 참석 신청!`;
    }
    if (isJoin) {
      this.eventsService.cancelJoin(isJoin.guestEventId);
      this.eventsService.createRsvpLog(eventId, userId, 'canceled'); // 참가 취소 로그 생성
      return `${eventId}번 모임 신청 취소!`;
    }
  }

  // 이벤트 수정
  @Patch(':eventId')
  @ApiOperation({ summary: 'Host로서 Event 수정' })
  @ApiOkResponse({ type: EventEntity })
  async update(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() updateEventDto: UpdateEventDto
  ) {
    const event = await this.eventsService.findOne(eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);

    return this.eventsService.update(eventId, updateEventDto);
  }

  // 이벤트 삭제
  @Delete(':eventId')
  @ApiOperation({ summary: 'Host로서 Event 삭제' })
  @ApiOkResponse({ description: 'isDeleted: true / soft Delete' })
  async remove(@Param('eventId', ParseIntPipe) eventId: number) {
    const event = await this.eventsService.findOne(eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);

    return this.eventsService.remove(eventId);
  }

  // 관심있는 이벤트 북마크 추가
  @Post(':eventId/bookmark')
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Event 북마크 추가' })
  async addBookmark(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Req() req: RequestWithUser
  ) {
    const { userId } = req.user;
    return this.eventsService.addBookmark(eventId, userId, 'bookmarked');
  }

  // 관심있는 이벤트 북마크 제거
  @Delete(':eventId/bookmark')
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Event 북마크 제거' })
  async removeBookmark(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Req() req: RequestWithUser
  ) {
    const { userId } = req.user;
    return this.eventsService.removeBookmark(eventId, userId, 'unbookmarked');
  }
}
