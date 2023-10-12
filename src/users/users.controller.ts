/* eslint-disable prettier/prettier */
// src/users/users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { CreateUserDetailDto } from './dto/create-user-detail.dto';
// import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // user 생성한다.
  /* Eric's user
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  */
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입이 성공하였습니다.' })
  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto) {
    return new UserEntity(await this.usersService.create(createUserDto));
  }

  // 전체 유저 리스트를 조회한다.
  @Get()
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: '회원 조회' })
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async findAll() {
    const users = await this.usersService.findAll();
    if (!users) {
      throw new NotFoundException('Users does not exist');
    }
    return users;
    // TODO: HEE's code
    // return users.map((user) => new UserEntity(user));
  }

  // 자신의 사용자 정보를 조회한다.
  // "TODO: implement me
  /**
  @Get(':me')
  findMe(){
    return this.usersService.findOne();
  }
   */

  // id 를 이용하여 사용자 정보를 조회한다.

  @Get(':id')
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: 'ID로 회원 조회' })
  async findOne(@Param('id') id: string) {
    const user = this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return user;
  }

  // 사용자 정보를 수정한다.
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(+id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException('User does not exist');
    }
    return updatedUser;
  }

  // 회원 탈퇴를 한다.
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    await this.usersService.remove(+id);
    return {'message' : '탈퇴되었습니다'};    
  }

  // 사용자가 생성한 모임 리스트를 조회한다.
  @Get(':id/hostedEvents')
  async findHostedEvents(@Param('id') id: string) {
    const hostedEvents = await this.usersService.findHostedEvents(+id);
    return hostedEvents;
  }

  // 사용자가 참가한 모임 리스트를 조회한다.
  @Get(':id/joinedEvents')
  findJoinedEvents(@Param('id') id: string) {
    const joinedEvents = this.usersService.findJoinedEvents(+id);
    return joinedEvents;
  }
  // 사용자가 관심 등록한 모임 리스트를 조회한다.
  // TODO
  /* 
  @Get(':id/likedEvents')
  findLikedEvents(@Param('id') id: string) {
    return this.usersService.findLikedEvents(+id);
  }
  */

  /* TODO: UserDetail 
  // User Detail 정보 생성
// @Post('/:id/user-detail')
// createUserDetail(@Body() createUserDetailDto: CreateUserDetailDto, @Param('id') id: string) {
//   return this.usersService.createUserDetail(createUserDetailDto, +id);
// }

// User Detail 정보 조회
@Get('/:id/user-detail')
findUserDetail(@Param('id') id: string) {
  return this.usersService.findUserDetail(+id);
}

// User Detail 정보 업데이트
@Patch('/:id/user-detail')
updateUserDetail(@Body() updateUserDetailDto: UpdateUserDetailDto, @Param('id') id: string) {
  return this.usersService.updateUserDetail(updateUserDetailDto, +id);
}
*/




}
