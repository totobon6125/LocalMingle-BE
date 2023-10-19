/* eslint-disable prettier/prettier */
// src/users/users.controller.ts
import { Controller, Req, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiBody, ApiConsumes, ApiProperty } from '@nestjs/swagger';
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
  @Post('/signup')
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto) {
    return new UserEntity(await this.usersService.create(createUserDto));
  }

  //이메일 중복 검증
  @Post('checkEmail')
  @ApiBody({})
  @ApiOperation({ summary: '이메일 중복 확인' })
  async checkEmail(@Body() { email }: { email: string }) {
    const existingUser = await this.usersService.findByEmail({ email });
    if (existingUser) {
      return { message: '201' };
    } else{
      return { message: '200'};
    }
  }
  
  //닉네임 중복 검증
  @Post('checkNickname')
  @ApiBody({})
  @ApiOperation({ summary: '닉네임 중복 확인' })
  async checkNickname(@Body() { nickname }: { nickname: string }) {
    const existingNickname = await this.usersService.findByNickname({ nickname });
    if (existingNickname) {
      return{ message: '201' };
    } else {
      //return res.status(200).json({ message: 'Nickname is available.' });
      return { message: '200' };
    }
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
  async findMe(@Req() req: RequestWithUser) {
    const { userId } = req.user; // request에 user 객체가 추가되었고 userId에 값 할당 
    const user = await this.usersService.findMe(userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return user;
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


  // 5. user 정보 수정한다.
  @Patch(':id')
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: '회원 정보 수정' })
  @ApiResponse({ status: 200, description: '회원 정보가 수정되었습니다' })
  @ApiResponse({ status: 400, description: '중복된 닉네임입니다' })
  @ApiResponse({ status: 401, description: '패스워드가 일치하지 않습니다' })
  @ApiResponse({ status: 404, description: '유저 정보가 존재하지 않습니다' })
  
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    await this.usersService.update(+id, updateUserDto);
    return {'message' : '회원 정보가 수정되었습니다'};
  }

  // 6. 회원 탈퇴를 한다.
  @Delete('withdrawal')
  @UseGuards(JwtAuthGuard) // passport를 사용하여 인증 확인
  @ApiBearerAuth() // Swagger 문서에 Bearer 토큰 인증 추가
  @ApiOperation({ summary: '회원 탈퇴' })
  async remove(@Req() req: RequestWithUser, @Body() DeleteUserDto: DeleteUserDto) {
    const { userId } = req.user; // request에 user 객체가 추가되었고 userId에 값 할당 ) 
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
  @ApiOperation({ summary: '내가 참가한 이벤트 조회' })
  findJoinedEvents(@Param('id') id: string) {
    console.log('findJoinedEvents in users.controller.ts - id:', id);
    const joinedEvents = this.usersService.findJoinedEvents(+id);
    return joinedEvents;
  }

  // 9. 사용자가 북마크한 이벤트 리스트를 조회한다.
  @Get(':id/bookmarkedEvents')
  @ApiOperation({ summary: '내가 북마크한 이벤트 조회' })
  async findBookmarkedEvents(@Param('id') id: string) {
    try {
      const bookmarkedEvents = await this.usersService.findBookmarkedEvents(+id, 'bookmarked');
      return bookmarkedEvents;
    } catch (error) {
      throw new NotFoundException('북마크한 이벤트를 찾을 수 없습니다.');
    }
  }

  // 10. 사용자 유저 프로필 이미지를 업로드 한다.
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

    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    // 이미지를 s3에 업로드한다.
    const uploadedFile = await this.awsS3Service.uploadFile(file) as { Location: string };

    // s3에 업로드된 이미지 URL을 DB에 저장한다.
    const s3ProfileImgURL = await this.usersService.updateProfileImage(userId, uploadedFile.Location);
    
    return {
      'message': '이미지가 업로드되었습니다',
      'profileImgURL' : s3ProfileImgURL,
      }
  }
}

