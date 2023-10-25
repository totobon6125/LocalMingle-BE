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
  UnauthorizedException,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from 'src/aws/aws.s3';
import { RequestWithUser } from './interface/event-controller.interface';

// request에 user 객체를 추가하기 위한 인터페이스

@Controller('events')
@ApiTags('Events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  @Post()
  @UseGuards(JwtAccessAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: '호스트로 Event 생성' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiCreatedResponse({ type: EventEntity })
  async create(
    @Req() req: RequestWithUser,
    @Body() createEventDto: CreateEventDto
  ) {
    const { userId } = req.user;

    return this.eventsService.create(userId, createEventDto);
  }

  @Put(':eventId/upload')
  @UseGuards(JwtAccessAuthGuard) 
  @ApiBearerAuth() 
  @ApiOperation({ summary: 'Event 이미지 업데이트' })
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
  async uploadFile(
    @UploadedFile() file,
    @Param('eventId', ParseIntPipe) eventId: number
  ) {
    // 이미지 파일 aws s3 서버에 저장
    const updatedImg = await this.awsS3Service.uploadEventFile(file) as {
      Location: string;
    };

    // 이미지 파일 DB에 URL 형태로 저장
    await this.eventsService.updateImg(eventId, updatedImg.Location);
    return {
      message: '이미지가 업로드되었습니다',
      ImgURL: updatedImg,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Event 전체 조회' })
  @ApiOkResponse({ type: EventEntity, isArray: true })
  async findAll() {
    const events = await this.eventsService.findAll();

    // 전체 조회 시 이벤트 호스트와 참가자 수 반환
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

  @Get(':eventId')
  @UseGuards(JwtAccessAuthGuard) 
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Event 상세 조회' })
  @ApiOkResponse({ type: EventEntity })
  async findOne(
    @Req() req: RequestWithUser,
    @Param('eventId', ParseIntPipe) eventId: number
  ) {
    const { userId } = req.user;

    // 로그인한 유저가 상세조회한 이벤트에 참가여부 확인
    const isJoin = await this.eventsService.isJoin(eventId, userId);
    const confirmJoin = isJoin ? true : false;

    const event = await this.eventsService.findOne(eventId);

    await this.eventsService.createViewLog(eventId);

    const { GuestEvents, HostEvents, ...rest } = event;

    return {
      event: rest,
      guestList: event.GuestEvents.length,
      hostUser: HostEvents[0].User.UserDetail,
      guestUser: GuestEvents.map((item) => {
        return item.User.UserDetail;
      }),
      isJoin: confirmJoin,
    };
  }

  @Put(':eventId/join')
  @UseGuards(JwtAccessAuthGuard) 
  @ApiBearerAuth() 
  @ApiOperation({ summary: 'Guest로서 Event 참가신청' })
  @ApiCreatedResponse({ description: `API를 홀수번 호출하면 참석신청 짝수번 신청하면 참석취소` })
  async join(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Req() req: RequestWithUser
  ) {
    const { userId } = req.user;
    const event = await this.eventsService.findOne(eventId);

    const isJoin = await this.eventsService.isJoin(eventId, userId);
    if (!isJoin) {
      if (event.maxSize <= event.GuestEvents.length) {
        return { message: `참가인원은 최대${event.maxSize}명 입니다 빠꾸입니다` };
      }
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
  @UseGuards(JwtAccessAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: 'Host로서 Event 수정' })
  @ApiOkResponse({ type: EventEntity })
  async update(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: RequestWithUser
  ) {
    const { userId } = req.user;
    const event = await this.eventsService.findOne(eventId);
    if (userId !== event.HostEvents[0].HostId) {
      throw new UnauthorizedException(`작성자만 수정할 수 있습니다`)
    }

    this.eventsService.update(eventId, updateEventDto);
    return {message: '수정이 완료되었습니다'}
  }

  // 이벤트 삭제
  @Delete(':eventId')
  @UseGuards(JwtAccessAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: 'Host로서 Event 삭제' })
  @ApiOkResponse({ description: 'soft Delete로 isDelete 필드를 true 바꿔 체킹만 해둔다. 조회는 되지 않음' })
  async remove(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Req() req: RequestWithUser
  ) {
    const { userId } = req.user;
    const event = await this.eventsService.findOne(eventId);
    if (userId !== event.HostEvents[0].HostId)
      throw new UnauthorizedException(`작성자만 삭제할 수 있습니다`);

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
