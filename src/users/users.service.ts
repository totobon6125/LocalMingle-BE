/* eslint-disable prettier/prettier */
// src/users/users.service.ts
import { BadRequestException, ConflictException,  Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User, UserDetail } from '@prisma/client';
import { IUsersServiceFindByEmail, IUsersServiceFindByNickname } from './interfaces/users-service.interface';
// import { PrismaService } from '../prisma/prisma.service';



@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  
  // 1. 유저를 생성한다. (회원가입)
  async create(createUserDto: CreateUserDto): Promise<User> {
  const { email, password, nickname, intro, confirmPassword/* , profileImg */ } = createUserDto;
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

  // Default 프로필 이미지 리스트
  // 순서: 회색, 하늘색, 주황색, 남색, 네온색, 녹색 
  const profileImgList = 
  ['https://s3-image-local-mingle.s3.ap-northeast-2.amazonaws.com/profileImg/1698025763231',
  'https://s3-image-local-mingle.s3.ap-northeast-2.amazonaws.com/profileImg/1698029706605',
  'https://s3-image-local-mingle.s3.ap-northeast-2.amazonaws.com/profileImg/1698029779728',
  'https://s3-image-local-mingle.s3.ap-northeast-2.amazonaws.com/profileImg/1698029799098',
  'https://s3-image-local-mingle.s3.ap-northeast-2.amazonaws.com/profileImg/1698029815362',
  'https://s3-image-local-mingle.s3.ap-northeast-2.amazonaws.com/profileImg/1698029828369'
  ]
  // Default 프로필 이미지 리스트 랜덤으로 하나 선택
  const randomProfileImg = profileImgList[Math.floor(Math.random() * profileImgList.length)];

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
            profileImg: randomProfileImg, // default 프로필 이미지 업로드
          },
        },
      },
    }),
  ]);

  return user;
  // return existingUser; // HeeDragon's OAuth code
  }
  
  //1-1이메일 중복 체크
  async findByEmail({ email }: IUsersServiceFindByEmail): Promise<User> {
    return this.prisma.user.findUnique({ where: { email } });
  }
  
  //1-2닉네임 중복 체크
  async findByNickname({ nickname }: IUsersServiceFindByNickname): Promise<UserDetail> {
    return this.prisma.userDetail.findUnique({ where: { nickname } });
  }

   // 사용자 ID로 사용자를 찾는 메서드 추가
   async findById(userId: number): Promise<User> {
    return this.prisma.user.findUnique({
      where: { userId },
    });
  }

  // 2. 전체 유저 리스트를 조회한다.
  async findAll() {
    return await this.prisma.user.findMany({
      where : { deletedAt: null },
    });
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
    const user = await this.prisma.user.findUnique({
      where: { userId: id },
      include: { UserDetail: true, HostEvents: true, GuestEvents: true},
    });
    
    if (!user || user.deletedAt !== null) {
      throw new BadRequestException('삭제된 회원이거나 존재하지 않는 회원입니다.');  
    }
    return user;
  }

  // 4. 이메일을 통한 유저 찾기
  // findByEmail({ email }: IUsersServiceFindByEmail): Promise<User> {
  //   // 이코드는 여러번 재사용 될 수 있기 떄문에 따로 빼줌
  //   return this.prisma.user.findUnique({ where: { email } });
  // }

  // 5. user 정보 수정한다.
  async update(id: number, updateUserDto: UpdateUserDto) {
    const { nickname, intro, confirmPassword, nameChanged } = updateUserDto;
    
    const user = await this.prisma.user.findUnique({
      where: { userId: id },
    });
    if (!user) {
      throw new BadRequestException('유저 정보가 존재하지 않습니다.');
    }

    
    if (!nameChanged) {
      // nameChanged == false 면 닉네임에는 변화가 없다는 것임으로 닉네임을 제외한 나머지 정보만 업데이트
      // 패스워드, 패스워드 확인 일치 여부 확인
      const isPasswordMatching = await bcrypt.compare(confirmPassword, user.password);
      if (!isPasswordMatching) {
        throw new BadRequestException('패스워드가 일치하지 않습니다.');
      }

      // userdetail page 자기소개 업데이트
      const updatedUser = await this.prisma.userDetail.update({
        where: { userDetailId: user.userId},
        data: { 
          intro: intro,
        },
        });
      return updatedUser;
      
    }
    else { 
      // nameChanged = true 면 닉네임을 바꿨다는 거니까 닉네임을 포함해서 업데이트
      // 중복된 닉네임 확인
      const existingNickname = await this.prisma.userDetail.findUnique({
        where: { nickname },
      });
      
      if (existingNickname) {
        throw new ConflictException('이미 존재하는 닉네임입니다.');
      }

      // 패스워드, 패스워드 확인 일치 여부 확인
      const isPasswordMatching = await bcrypt.compare(confirmPassword, user.password);
      if (!isPasswordMatching) {
        throw new BadRequestException('패스워드가 일치하지 않습니다.');
      }

      // userdetail page 닉네임, 자기소개, 업데이트
      const updatedUser = await this.prisma.userDetail.update({
      where: { userDetailId: user.userId},
        data: { 
          intro: intro,
          nickname: nickname
        },
        });
      return updatedUser;
    }
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
    return await this.prisma.user.update({
      where: { userId: userId },
      data: { deletedAt: new Date() },
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
          where: { Event: { isDeleted: false } },
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
          where: { Event: { isDeleted: false } },
        },
      },
    });
  }

// 10. 사용자가 북마크한 이벤트 리스트를 조회한다. 
async findBookmarkedEvents(id: number) {
  const events = await this.prisma.eventBookmark.findMany({
    where: { UserId: id },
    include: { Event: true },
    orderBy: {
      updatedAt: 'desc', // 가장 최신의 이벤트를 먼저 가져옴
    },
  });

  if (!events.length) {
    throw new NotFoundException('북마크한 이벤트가 없습니다.');
  }

  const latestEventBookmarks = new Map<number, any>(); // Key: EventId, Value: eventBookmark entry

  for (const event of events) {
    // 이미 본 EventId가 아니면 Map에 추가
    if (!latestEventBookmarks.has(event.EventId)) {
      latestEventBookmarks.set(event.EventId, event);
    }
  }
  // status가 "bookmarked"인 것만 필터링
  const bookmarkedEvents = Array.from(latestEventBookmarks.values()).filter(event => event.status === 'bookmarked');

  // console.log(bookmarkedEvents);
  return bookmarkedEvents; // 각 EventId 당 가장 최신의 'bookmarked' 상태의 eventBookmark 엔트리 배열 반환
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
    
    // userDetailId를 사용하여 프로필 이미지를 업데이트한다.
    const updatedProfileImage = await this.prisma.userDetail.update({
      where: { userDetailId: userDetail.userDetailId },
      data: { profileImg: profileImg },
    });
    return updatedProfileImage.profileImg;
  }  
}
