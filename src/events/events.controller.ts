import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventEntity } from './entities/event.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('events')
@ApiTags('Events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: 'Event 생성' })
  @ApiCreatedResponse({ type: EventEntity })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({summary: 'Event 전체 조회'})
  @ApiOkResponse({ type: EventEntity, isArray: true })
  async findAll() {
    const events = await this.eventsService.findAll();

    const event = events.map((item) => {
      return {
        event: item,
        guestList: item.GuestEvents.length-1,
      };
    });
    return event;
  }

  @Get(':eventId')
  @ApiOperation({summary: 'Event 상세 조회'})
  @ApiOkResponse({ type: EventEntity })
  async findOne(@Param('eventId') eventId: string) {
    const event = await this.eventsService.findOne(+eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);

    await this.eventsService.createViewLog(+eventId);

    const guestList = event.GuestEvents.length-1;
    const { GuestEvents, ...data } = event;

    return { data, guestList };
  }

  @Put(':eventId/join')
  @ApiOperation({summary: 'Event 참석 신청 / 취소'})
  async join(
    @Param('eventId') eventId: string,
    @Body('userId') userId: string,
  ) {
    const event = await this.eventsService.findOne(+eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);

    const isJoin = await this.eventsService.isJoin(+eventId, +userId);
    if (!isJoin) {
      this.eventsService.join(+eventId, +userId);
      return `${eventId}번 모임 참석 신청!`;
    }
    if (isJoin) {
      this.eventsService.cancleJoin(isJoin.guestEventId);
      return `${eventId}번 모임 신청 취소!`;
    }
  }

  @Patch(':eventId')
  @ApiOperation({summary: 'Event 수정'})
  @ApiOkResponse({ type: EventEntity })
  async update(
    @Param('eventId') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventsService.findOne(+eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);

    return this.eventsService.update(+eventId, updateEventDto);
  }

  @Delete(':eventId')
  @ApiOperation({summary: 'Event 삭제'})
  @ApiOkResponse({ description: 'isDeleted: true / soft Delete' })
  async remove(@Param('eventId') eventId: string) {
    const event = await this.eventsService.findOne(+eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);

    return this.eventsService.remove(+eventId);
  }
}
