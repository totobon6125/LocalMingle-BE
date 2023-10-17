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
  ApiBody
} from '@nestjs/swagger';
import { EventEntity } from './entities/event.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

// request에 user 객체를 추가하기 위한 인터페이스
interface RequestWithUser extends Request {
  user: User;
}

@Controller('events')
@ApiTags('Events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: '호스트로 Event 생성' })
  @ApiCreatedResponse({ type: EventEntity })
  create(@Req() req: RequestWithUser, @Body() createEventDto: CreateEventDto) {
    const { userId } = req.user; // request에 user 객체가 추가되었고 userId에 값 할당

    return this.eventsService.create(userId, createEventDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Event 이미지 업로드' })
  @ApiConsumes('multipart/form-data')  
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
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File
  ) {
    console.log("file", file)
    return this.eventsService.upladFile(file)
  }

  @Get()
  @ApiOperation({ summary: 'Event 전체 조회' })
  @ApiOkResponse({ type: EventEntity, isArray: true })
  async findAll() {
    const events = await this.eventsService.findAll();

    const event = events.map((item) => {
      return {
        event: item,
        guestList: item.GuestEvents.length,
      };
    });
    return event;
  }

  @Get(':eventId')
  @ApiOperation({ summary: 'Event 상세 조회' })
  @ApiOkResponse({ type: EventEntity })
  async findOne(@Param('eventId', ParseIntPipe) eventId: number) {
    const event = await this.eventsService.findOne(eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);

    await this.eventsService.createViewLog(eventId);

    const guestList = event.GuestEvents.length;
    const { ...data } = event;
    return { data, guestList };
  }

  @Put(':eventId/join')
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: 'Guest로서 Event 참가신청' })
  @ApiCreatedResponse({ description: `모임 참석 신청 / 취소` })
  async join(@Param('eventId', ParseIntPipe) eventId: number, @Req() req: RequestWithUser) {
    const event = await this.eventsService.findOne(eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);

    const { userId } = req.user;
    const isJoin = await this.eventsService.isJoin(+eventId, userId);
    if (!isJoin) {
      this.eventsService.join(+eventId, userId);
      return `${eventId}번 모임 참석 신청!`;
    }
    if (isJoin) {
      this.eventsService.cancelJoin(isJoin.guestEventId);
      return `${eventId}번 모임 신청 취소!`;
    }
  }

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

  @Delete(':eventId')
  @ApiOperation({ summary: 'Host로서 Event 삭제' })
  @ApiOkResponse({ description: 'isDeleted: true / soft Delete' })
  async remove(@Param('eventId', ParseIntPipe) eventId: number) {
    const event = await this.eventsService.findOne(eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);

    return this.eventsService.remove(eventId);
  }
}
