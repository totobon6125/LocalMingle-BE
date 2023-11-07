import {
  Controller,
  Req,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AwsS3Service } from 'src/aws/aws.s3';
import { EventsService } from './events.service';
import { RequestWithUser } from '../users/interfaces/users.interface';

@Controller('events')
@ApiTags('Events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  // 1. 호스트로 이벤트 생성
  @Post()
  @ApiOperation({ summary: '호스트로 Event 생성' })
  @ApiCreatedResponse({ type: EventEntity })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async create(
    @Req() req: RequestWithUser,
    @Body() createEventDto: CreateEventDto
  ) {
    const { userId } = req.user;
    return this.eventsService.create(userId, createEventDto);
  }

  // 2. 이벤트 전체 조회
  @Get()
  @ApiOperation({ summary: 'Event 전체 조회' })
  @ApiOkResponse({ type: EventEntity, isArray: true })
  async findAll(@Query('lastPage', ParseIntPipe) lastPage: number) {
    const events = await this.eventsService.findAll(lastPage);

    // 전체 조회 시 이벤트 호스트와 참가자 수 반환
    const event = events.map((item) => {
      const { GuestEvents, HostEvents, ...rest } = item;
      const hostUser = HostEvents[0].User.UserDetail;

      return {
        event: rest,
        guestList: GuestEvents.length,
        hostUser: hostUser,
      };
    });
    return event;
  }

  // 3. 이벤트 상세 조회
  @Get(':eventId')
  @ApiOperation({ summary: 'Event 상세 조회' })
  @ApiOkResponse({ type: EventEntity })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async findOne(
    @Req() req: RequestWithUser,
    @Param('eventId', ParseIntPipe) eventId: number
  ) {
    const { userId } = req.user;

    // 로그인한 유저가 상세조회한 이벤트에 참가여부 확인
    const isJoin = await this.eventsService.isJoin(eventId, userId);
    const confirmJoin = isJoin ? true : false;

    const event = await this.eventsService.findOne(eventId);
    const { GuestEvents, HostEvents, ...rest } = event;

    // 조회수 로그 생성
    await this.eventsService.createViewLog(eventId, userId);

    return {
      event: rest,
      guestList: GuestEvents.length,
      hostUser: HostEvents[0].User.UserDetail,
      guestUser: GuestEvents.map((item) => {
        return item.User.UserDetail;
      }),
      isJoin: confirmJoin,
    };
  }

  // 4. 이벤트 참가 신청
  @Post(':eventId/join')
  @ApiOperation({ summary: 'Guest로서 Event 참가신청' })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async join(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Req() req: RequestWithUser
  ) {
    const { userId } = req.user;
    const event = await this.eventsService.findOne(eventId);

    const isJoin = await this.eventsService.isJoin(eventId, userId);
    if (!isJoin) {
      if (event.maxSize <= event.GuestEvents.length) {
        return {
          message: `참가인원은 최대${event.maxSize}명 입니다`,
        };
      }

      this.eventsService.join(eventId, userId);
      this.eventsService.createRsvpLog(eventId, userId, 'applied'); // 참가 신청 로그 생성
      return {
        message: `${eventId}번 모임 참가 신청`,
        confirm: true,
      };
    } else {
      return {
        message: '이미 참석한 이벤트입니다',
      };
    }
  }
  // 4-1. 이벤트 참가 취소
  @Delete(':eventId/join')
  @ApiOperation({ summary: 'Guest로서 Event 참가 취소' })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async cancelJoin(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Req() req: RequestWithUser
  ) {
    const { userId } = req.user;
    await this.eventsService.findOne(eventId);
    const isJoin = await this.eventsService.isJoin(eventId, userId);

    if (isJoin) {
      this.eventsService.cancelJoin(isJoin.guestEventId);
      this.eventsService.createRsvpLog(eventId, userId, 'canceled');
    } else {
      return {
        message: '참석한 이벤트만 취소할 수 있습니다',
      };
    }
    return {
      message: `${eventId}번 모임 참가 취소`,
      confirm: false,
    };
  }

  // 5. 이벤트 수정
  @Patch(':eventId')
  @ApiOperation({ summary: 'Host로서 Event 수정' })
  @ApiOkResponse({ type: EventEntity })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async update(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: RequestWithUser
  ) {
    const { userId } = req.user;
    const event = await this.eventsService.findOne(eventId);

    // 작성자가 호스트인지 확인 후 같지 않은 경우 수정 불가
    if (userId !== event.HostEvents[0].HostId) {
      throw new UnauthorizedException(`작성자만 수정할 수 있습니다`);
    }

    this.eventsService.update(eventId, updateEventDto);
    return { message: '수정이 완료되었습니다' };
  }

  // 5-1. 이벤트 이미지 업로드
  @Put(':eventId/upload')
  @ApiOperation({ summary: 'Event 이미지 업데이트' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
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
    const updatedImg = (await this.awsS3Service.uploadEventFile(file)) as {
      Location: string;
    };

    // 이미지 파일 DB에 URL 형태로 저장
    await this.eventsService.updateImg(eventId, updatedImg.Location);
    return {
      message: '이미지가 업로드되었습니다',
      ImgURL: updatedImg,
    };
  }

  // 6. 이벤트 삭제
  @Delete(':eventId')
  @ApiOperation({ summary: 'Host로서 Event 삭제' })
  @ApiOkResponse({
    description:
      'soft Delete로 isDelete 필드를 true 바꿔 체킹만 해둔다. 조회는 되지 않음',
  })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
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

  // 7-1. 관심있는 이벤트 북마크 추가
  @Post(':eventId/bookmark')
  @ApiOperation({ summary: 'Event 북마크 추가' })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async addBookmark(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Req() req: RequestWithUser
  ) {
    const { userId } = req.user;
    return this.eventsService.addBookmark(eventId, userId, 'bookmarked');
  }

  // 7-2. 관심있는 이벤트 북마크 제거
  @Delete(':eventId/bookmark')
  @ApiOperation({ summary: 'Event 북마크 제거' })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async removeBookmark(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Req() req: RequestWithUser
  ) {
    const { userId } = req.user;
    return this.eventsService.removeBookmark(eventId, userId, 'unbookmarked');
  }
}
