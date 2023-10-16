/* eslint-disable prettier/prettier */
// src/users/users.service.ts
import { BadRequestException, ConflictException,  Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { IUsersServiceFindByEmail } from './interfaces/users-service.interface';



@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  
  // 1. 유저를 생성한다. (회원가입)
  async create(createUserDto: CreateUserDto): Promise<User> {
  const { email, password, nickname, intro, confirmPassword, profileImg } = createUserDto;
  // 리팩토링시 !== 로 변경
  if  (password != confirmPassword){
      throw new BadRequestException('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    }
  // 이메일 중복 체크
  const existingUser = await this.findByEmail({ email });
  if (existingUser) {
    throw new ConflictException('이미 등록된 이메일입니다.');
  }

  // 닉네임 중복 체크
  const existingNickname = await this.prisma.userDetail.findUnique({
    where: { nickname },
  });
  if (existingNickname) {
    throw new ConflictException('이미 사용 중인 닉네임입니다.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // 트랜잭션을 사용하여 user와 UserDetail 생성
  const [user] = await this.prisma.$transaction([
    this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        UserDetail: {
          create: {
            nickname,
            intro,
            profileImg: '기본 이미지 URL',
          },
        },
      },
    }),
  ]);

  return user;
  // return existingUser; // HeeDragon's OAuth code
  }
  
  // 2. 전체 유저 리스트를 조회한다.
  async findAll() {
    return await this.prisma.user.findMany({});
  }
  
  // 3. 유저 본인 조회
  async findMe(userId: number) {
    return await this.prisma.user.findUnique({
      where: { userId },
      include: { UserDetail: true },
      });
  }

  // 3. userId를 통한 유저 조회
  async findOne(id: number) {
    return await this.prisma.user.findUnique({
      where: { userId: id },
      include: { UserDetail: true, HostEvents: true, GuestEvents: true},
    });
  }

  // 4. 이메일을 통한 유저 찾기
  findByEmail({ email }: IUsersServiceFindByEmail): Promise<User> {
    // 이코드는 여러번 재사용 될 수 있기 떄문에 따로 빼줌
    return this.prisma.user.findUnique({ where: { email } });
  }

  /* FiXME */
  // 5. user 정보 수정한다.
  async update(id: number, updateUserDto: UpdateUserDto) {
    console.log('updateUserDto in users.service:', updateUserDto)
    const { nickname, intro, confirmPassword } = updateUserDto;

    const user = await this.prisma.user.findUnique({
      where: { userId: id },
    });
    if (!user) {
      throw new BadRequestException('유저 정보가 존재하지 않습니다.');
    }

    // 패스워드, 패스워드 확인 일치 여부 확인
    const isPasswordMatching = await bcrypt.compare(confirmPassword, user.password);
    if (!isPasswordMatching) {
      throw new BadRequestException('패스워드가 일치하지 않습니다.');
    }
    // 중복된 닉네임 확인 
    const existingNickname = await this.prisma.userDetail.findUnique({
      where: { nickname },
    });
    if (existingNickname) {
      throw new ConflictException('중복된 닉네임입니다.');
    }

    // userdetail page 업데이트 
    const updatedUser = await this.prisma.userDetail.update({
        where: { userDetailId: user.userId},
        data: { 
          intro: intro,
          nickname: nickname
        },
      });

      return updatedUser;
      
  }

  // 6. 회원 탈퇴를 한다.
  async remove(userId: number, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      throw new BadRequestException('회원 정보가 존재하지 않습니다.');
    }
    
    // bcrypt를 사용하여 패스워드를 비교한다.
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }
    
    // 패스워드가 일치하면 유저 삭제
    return await this.prisma.user.delete({
      where: { userId: userId},
    });
  }

  // 7. 사용자가 생성한 모임(Event) 리스트를 조회한다. HostEvents
  async findHostedEvents(id: number) {
    return await this.prisma.user.findUnique({
      where: { userId: id },
      include: { 
        HostEvents: {
          select: {
            Event: true,
          },
        },
      },
    });
  }

  // 8. 사용자가 참가한 모임(Event) 리스트를 조회한다. GuestEvents의 guestId, eventId를 이용하여 Event를 찾는다.
  async findJoinedEvents(id: number) {
    return await this.prisma.user.findUnique({
      where: { userId: id },
      include: { 
        GuestEvents: {
          select: {
            Event: true,
          },
        },
      },
    });
  }

  // 9. 프로필 이미지를 업데이트 한다.
  async updateProfileImage(id: number, profileImg: string) {
    // 먼저 UserId를 통해 UserDetail을 찾고, UserDetail의 profileImg를 업데이트 한다.
    const userDetail = await this.prisma.userDetail.findFirst({
      where: { UserId: id },
    });

    if (!userDetail) {
      throw new BadRequestException('회원 상세 정보가 존재하지 않습니다.');
    }
    
    console.log("3. profileImg URL in usrs.service", profileImg);
    // userDetailId를 사용하여 프로필 이미지를 업데이트한다.
    const updatedProfileImage = await this.prisma.userDetail.update({
      where: { userDetailId: userDetail.userDetailId },
      data: { profileImg: profileImg },
    });
    return updatedProfileImage.profileImg;
  }
}
