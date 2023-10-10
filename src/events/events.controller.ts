import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Put } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EventEntity } from './entities/event.entity';

@Controller('events')
@ApiTags('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiCreatedResponse({type: EventEntity})
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOkResponse({type: EventEntity, isArray: true})
  async findAll() {
    const events = await this.eventsService.findAll()

    const event = events.map((item)=>{
      return {
        event: item,
        guestList: item.GuestEvents.length
      }
    })
    return event
  }

  @Get(':eventId')
  @ApiOkResponse({type: EventEntity})
  async findOne(@Param('eventId') eventId: string) {
    const event = await this.eventsService.findOne(+eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);

    await this.eventsService.createViewLog(+eventId)

    const guestList = event.GuestEvents.length
    const {GuestEvents, ...data} = event

    return {data, guestList}
  }

  @Put(':eventId/join')
  @ApiCreatedResponse({description: `모임 참석 신청 / 취소`})
  async join(@Param('eventId') eventId: string, @Body('userId') userId: string) {
  
    const event = await this.eventsService.findOne(+eventId);
    if (!event) throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);
    
    const isJoin = await this.eventsService.isJoin(+eventId, +userId);
    console.log(isJoin)
    if (!isJoin) {
      this.eventsService.join(+eventId, +userId)
      return `${eventId}번 모임 참석 신청!`
    }
    if (isJoin) {
      this.eventsService.cancleJoin(isJoin.guestEventId);
      return `${eventId}번 모임 신청 취소!`
    }
  }

  @Patch(':id')
  @ApiOkResponse({type: EventEntity})
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  @ApiOkResponse({type: EventEntity})
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }

}
