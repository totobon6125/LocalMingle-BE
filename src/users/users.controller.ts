/* eslint-disable prettier/prettier */
// src/users/users.controller.ts
import { Controller, Req, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from '@prisma/client';
import { AwsS3Service } from 'src/aws/aws.s3';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';


// request에 user 객체를 추가하기 위한 인터페이스
interface RequestWithUser extends Request {
  user: User;
}
@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly awsS3Service: AwsS3Service, 
    ) {}

  // 1. 유저를 생성한다. (회원가입)
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입이 성공하였습니다.' })
  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto) {
    return new UserEntity(await this.usersService.create(createUserDto));
  }

  // 2. 전체 유저 리스트를 조회한다.
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

    // TODO: HEE's code
    const userEntity = users.map((user) => new UserEntity(user));
    console.log(userEntity);
    // return users.map((user) => new UserEntity(user));

    return users;
  }

  // 유저 자신의 정보를 조회한다.
  @Get('me')
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: '유저 본인 조회' })
  findMe(@Req() req: RequestWithUser) {
    const { userId } = req.user; // request에 user 객체가 추가되었고 userId에 값 할당 
    return this.usersService.findMe(userId);
  }

  // 3. userId를 통한 유저 조회
  @Get(':id')
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: 'ID로 회원 조회' })
  @ApiResponse({ status: 200, description: '유저 정보 조회 성공' })
  async findOne(@Param('id') id: string) {
    const user = this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return user;
  }

  /* FIXME */
  // 5. user 정보 수정한다.
  @Patch(':id')
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: '회원 정보 수정' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(+id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException('User does not exist');
    }
    return updatedUser;
  }

  // 6. 회원 탈퇴를 한다.
  @Delete('withdrawal')
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: '회원 탈퇴' })
  async remove(@Req() req: RequestWithUser, @Body() DeleteUserDto: DeleteUserDto) {
    const { userId } = req.user; // request에 user 객체가 추가되었고 userId에 값 할당 ) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    await this.usersService.remove(userId, DeleteUserDto.password);
    return {'message' : '탈퇴되었습니다'};    
  }

  // 7. 사용자가 생성한 모임 리스트를 조회한다.
  @Get(':id/hostedEvents')
  @ApiOperation({ summary: '내가 호스트한 이벤트 조회' })
  async findHostedEvents(@Param('id') id: string) {
    const hostedEvents = await this.usersService.findHostedEvents(+id);
    return hostedEvents;
  }

  // 8. 사용자가 참가한 모임 리스트를 조회한다.
  @Get(':id/joinedEvents')
  @ApiOperation({ summary: '내가 참가한 이벤트 회' })
  findJoinedEvents(@Param('id') id: string) {
    console.log('findJoinedEvents in users.controller.ts - id:', id);
    const joinedEvents = this.usersService.findJoinedEvents(+id);
    return joinedEvents;
  }

  // 9. 사용자 유저 프로필 이미지를 업로드 한다.
  @Post('upload')
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: '프로필 이미지 업로드' })
  @ApiConsumes('multipart/form-data')  
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    description: 'User profile image',
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
  async updateProfileImage(@Req() req: RequestWithUser, @UploadedFile() file) {
    const { userId } = req.user;

    console.log('updateProfileImage in users.controller.ts - userId:', userId);
    console.log('updateProfileImage in users.controller.ts - file:', file);
    
    const user = await this.usersService.findOne(userId);
    console.log('User:', user);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const uploadedFile = await this.awsS3Service.uploadFile(file) as { Location: string };
    return this.usersService.updateProfileImage(userId, uploadedFile.Location);
  }

  // 사용자가 관심 등록한 모임 리스트를 조회한다.
  // TODO
  /* 
  @Get(':id/savedEvents')
  findSavedEvents(@Param('id') id: string) {
    return this.usersService.findSavedEvent(+id);
  }
  */

}

