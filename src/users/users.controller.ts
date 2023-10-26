// src/users/users.controller.ts
import {
  Controller,
  Req,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-userPassword.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/users/interfaces/users.interface';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { AwsS3Service } from 'src/aws/aws.s3';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  // 1. 유저를 생성한다. (회원가입)
  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiCreatedResponse({ type: UserEntity })
  @ApiResponse({ status: 201, description: '회원가입이 성공하였습니다.' })
  async create(@Body() createUserDto: CreateUserDto) {
    return new UserEntity(await this.usersService.create(createUserDto));
  }

  // 1-1 이메일 중복 검증
  // FIXME: HeeDragon - ApiBody 추가, message 개선
  @Post('checkEmail')
  @ApiOperation({ summary: '이메일 중복 확인' })
  @ApiBody({})
  async checkEmail(@Body() { email }: { email: string }) {
    const existingUser = await this.usersService.findByEmail({ email });
    if (existingUser) {
      return { message: '201' };
    } else {
      return { message: '200' };
    }
  }

  // 1-2 닉네임 중복 검증
  // FIXME: HeeDragon - ApiBody 추가, message 개선  @Post('checkNickname')
  @ApiOperation({ summary: '닉네임 중복 확인' })
  @ApiBody({})
  async checkNickname(@Body() { nickname }: { nickname: string }) {
    const existingNickname = await this.usersService.findByNickname({
      nickname,
    });
    if (existingNickname) {
      return { message: '201' };
    } else {
      return { message: '200' };
    }
  }

  // 2. 전체 유저 리스트를 조회한다.
  @Get()
  @ApiOperation({ summary: '회원 조회' })
  @ApiOkResponse({ type: UserEntity, isArray: true })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.usersService.findAll();
  }

  // 2-1. 유저 본인을 조회한다.
  @Get('me')
  @ApiOperation({ summary: '유저 본인 조회' })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async findMe(@Req() req: RequestWithUser) {
    const { userId } = req.user;
    const user = await this.usersService.findMe(userId);
    return user;
  }

  // 2-2. userId를 통한 유저 조회
  @Get(':userId')
  @ApiOperation({ summary: 'ID로 회원 조회' })
  @ApiResponse({ status: 200, description: '유저 정보 조회 성공' })
  @ApiResponse({ status: 404, description: '유저 정보가 존재하지 않습니다' })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.findOne(userId);
  }

  // 3. user 정보 수정
  @Patch('update')
  @ApiOperation({ summary: '회원 정보 수정' })
  @ApiResponse({ status: 200, description: '회원 정보가 수정되었습니다' })
  @ApiResponse({ status: 400, description: '중복된 닉네임입니다' })
  @ApiResponse({ status: 404, description: '유저 정보가 존재하지 않습니다' })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async update(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const { userId } = req.user;
    await this.usersService.update(userId, updateUserDto);
    return { message: '회원 정보가 수정되었습니다' };
  }

  // 4. user 비밀번호 변경한다
  @Patch('updatePassword')
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({ status: 200, description: '비밀번호가 변경되었습니다' })
  @ApiResponse({ status: 404, description: '유저 정보가 존재하지 않습니다' })
  @ApiResponse({
    status: 400,
    description: '동일한 비밀번호를 입력하였습니다',
  })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async updatePassword(
    @Req() req: RequestWithUser,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto
  ) {
    const { userId } = req.user;
    await this.usersService.updatePassword(userId, updateUserPasswordDto);
    return { message: '비밀번호가 변경되었습니다' };
  }

  // 5. 회원 탈퇴를 한다.
  @Delete('withdrawal')
  @ApiOperation({ summary: '회원 탈퇴' })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async remove(
    @Req() req: RequestWithUser,
    @Body() deleteUserDto: DeleteUserDto
  ) {
    const { userId } = req.user;
    await this.usersService.remove(userId, deleteUserDto.password);
    return { message: '탈퇴되었습니다' };
  }

  // 6. 사용자가 생성한 모임 리스트를 조회한다.
  @Get(':userId/hostedEvents')
  @ApiOperation({ summary: '내가 호스트한 이벤트 조회' })
  async findHostedEvents(@Param('userId', ParseIntPipe) userId: number) {
    const hostedEvents = await this.usersService.findHostedEvents(userId);
    return hostedEvents;
  }

  // 7. 사용자가 참가한 모임 리스트를 조회한다.
  @Get(':userId/joinedEvents')
  @ApiOperation({ summary: '내가 참가한 이벤트 조회' })
  async findJoinedEvents(@Param('userId', ParseIntPipe) userId: number) {
    const joinedEvents = await this.usersService.findJoinedEvents(userId);
    return joinedEvents;
  }

  // 8. 사용자가 북마크한 이벤트 리스트를 조회한다.
  @Get(':userId/bookmarkedEvents')
  @ApiOperation({ summary: '내가 북마크한 이벤트 조회' })
  async findBookmarkedEvents(@Param('userId', ParseIntPipe) userId: number) {
    const bookmarkedEvents = this.usersService.findBookmarkedEvents(userId);
    return bookmarkedEvents;
  }

  // 9. 사용자 유저 프로필 이미지를 업로드 한다.
  @Post('upload')
  @ApiOperation({ summary: '프로필 이미지 업로드' })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
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

    //이미지를 s3에 업로드한다.
    const uploadedFile = (await this.awsS3Service.uploadFile(file)) as {
      Location: string;
    };

    // s3에 업로드된 이미지 URL을 DB에 저장한다.
    const s3ProfileImgURL = await this.usersService.updateProfileImage(
      userId,
      uploadedFile.Location
    );
    return {
      message: '이미지가 업로드되었습니다',
      profileImgURL: s3ProfileImgURL,
    };
  }
}
