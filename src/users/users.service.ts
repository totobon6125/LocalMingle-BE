// src/users/users.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-userPassword.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User, UserDetail } from '@prisma/client';
import {
  IUsersServiceFindByEmail,
  IUsersServiceFindByNickname,
} from './interfaces/users.interface';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 1. 유저를 생성한다. (회원가입)
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, nickname, intro, confirmPassword } = createUserDto;
    // 비밀번호 매칭 체크
    if (password !== confirmPassword) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
      );
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

    /** 초기 프로필 이미지 세팅
     * Default 프로필 이미지 리스트
     * 순서: 회색, 하늘색, 주황색, 남색, 네온색, 녹색
     */
    const profileImgList = [
      'https://s3-image-local-mingle.s3.ap-northeast-2.amazonaws.com/profileImg/1698025763231',
      'https://s3-image-local-mingle.s3.ap-northeast-2.amazonaws.com/profileImg/1698029706605',
      'https://s3-image-local-mingle.s3.ap-northeast-2.amazonaws.com/profileImg/1698029779728',
      'https://s3-image-local-mingle.s3.ap-northeast-2.amazonaws.com/profileImg/1698029799098',
      'https://s3-image-local-mingle.s3.ap-northeast-2.amazonaws.com/profileImg/1698029815362',
      'https://s3-image-local-mingle.s3.ap-northeast-2.amazonaws.com/profileImg/1698029828369',
    ];
    // Default 프로필 이미지 리스트 랜덤으로 하나 선택
    const randomProfileImg =
      profileImgList[Math.floor(Math.random() * profileImgList.length)];

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
  }

  //1-1 이메일 중복 체크
  async findByEmail({ email }: IUsersServiceFindByEmail): Promise<User> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  //1-2 닉네임 중복 체크
  async findByNickname({
    nickname,
  }: IUsersServiceFindByNickname): Promise<UserDetail> {
    return this.prisma.userDetail.findUnique({ where: { nickname } });
  }

  //1-3 사용자 ID로 사용자 조회
  // FIXME: HeeDragon 필요한지
  async findById(userId: number): Promise<User> {
    return this.prisma.user.findUnique({
      where: { userId },
    });
  }

  // 2. 전체 유저 리스트를 조회한다.
  async findAll() {
    return await this.prisma.user.findMany({
      where: { deletedAt: null },
    });
  }

  // 2-1. 유저 본인을 조회한다.
  async findMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: { UserDetail: true },
    });
    return user;
  }

  // 2-2. userId를 통한 유저 조회
  async findOne(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: { UserDetail: true, HostEvents: true, GuestEvents: true },
    });
    if (!user || user.deletedAt !== null) {
      throw new NotFoundException(
        '삭제된 회원이거나 존재하지 않는 회원입니다.'
      );
    }
    return user;
  }

  // 3. user 정보 수정
  async update(userId: number, updateUserDto: UpdateUserDto) {
    const { nickname, intro, nameChanged, userLocation } = updateUserDto;

    const user = await this.prisma.user.findUnique({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException('유저 정보가 존재하지 않습니다.');
    }

    if (!nameChanged) {
      // 자기소개, 유저주소 업데이트 : nameChanged == false 면 닉네임에는 변화가 없다는 것임으로 닉네임을 제외한 나머지 정보만 업데이트

      // userdetail page 자기소개 업데이트
      const updatedUser = await this.prisma.userDetail.update({
        where: { userDetailId: user.userId },
        data: {
          intro: intro,
          userLocation: userLocation,
        },
      });
      return updatedUser;
    } else {
      // 닉네임, 자기소개 업데이트 : nameChanged = true 면 닉네임을 바꿨다는 거니까 닉네임을 포함해서 업데이트

      // 중복된 닉네임 확인
      const existingNickname = await this.prisma.userDetail.findUnique({
        where: { nickname },
      });

      if (existingNickname) {
        throw new ConflictException('이미 존재하는 닉네임입니다.');
      }

      // userdetail page 닉네임, 자기소개, 업데이트
      const updatedUser = await this.prisma.userDetail.update({
        where: { userDetailId: user.userId },
        data: {
          intro: intro,
          nickname: nickname,
          userLocation: userLocation,
        },
      });
      return updatedUser;
    }
  }

  // 4. update 유저 정보 수정 - 패스워드 변경
  async updatePassword(
    userId: number,
    updateUserPasswordDto: UpdateUserPasswordDto
  ) {
    const newPassword = updateUserPasswordDto.password;

    // 패스워드 암호화
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 유저 존재 여부 확인
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });
    if (!user) {
      throw new BadRequestException('유저 정보가 존재하지 않습니다');
    }

    // 기존 현재 패스워드와 변경하려는 새로운 패스워드가 같은지 확인 후 같은 경우 에러
    const isPasswordMatching = await bcrypt.compare(newPassword, user.password);
    if (isPasswordMatching) {
      throw new BadRequestException('동일한 비밀번호를 입력하였습니다');
    }

    // password 업데이트
    const updatedUserPassword = await this.prisma.user.update({
      where: { userId },
      data: { password: hashedNewPassword },
    });
    return updatedUserPassword;
  }

  // 5. 회원 탈퇴를 한다.
  async remove(userId: number, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('회원 정보가 존재하지 않습니다.');
    }

    // bcrypt를 사용하여 패스워드를 비교한다.
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    // 패스워드가 일치하면 유저 삭제
    return await this.prisma.user.update({
      where: { userId },
      data: { deletedAt: new Date() },
    });
  }

  // 6. 사용자가 생성한 모임(Event) 리스트를 조회한다. HostEvents
  async findHostedEvents(userId: number) {
    return await this.prisma.user.findUnique({
      where: { userId },
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

  // 7. 사용자가 참가한 모임(Event) 리스트를 조회한다. GuestEvents의 guestId, eventId를 이용하여 Event를 찾는다.
  async findJoinedEvents(userId: number) {
    return await this.prisma.user.findUnique({
      where: { userId },
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

  // 8. 사용자가 북마크한 이벤트 리스트를 조회한다.
  async findBookmarkedEvents(userId: number) {
    const events = await this.prisma.eventBookmark.findMany({
      where: { UserId: userId },
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
    const bookmarkedEvents = Array.from(latestEventBookmarks.values()).filter(
      (event) => event.status === 'bookmarked'
    );

    return bookmarkedEvents; // 각 EventId 당 가장 최신의 'bookmarked' 상태의 eventBookmark 엔트리 배열 반환
  }

  // 9. 프로필 이미지를 업데이트 한다.
  async updateProfileImage(userId: number, profileImg: string) {
    // 먼저 UserId를 통해 UserDetail을 찾고, UserDetail의 profileImg를 업데이트 한다.
    const userDetail = await this.prisma.userDetail.findFirst({
      where: { UserId: userId },
    });

    if (!userDetail) {
      throw new NotFoundException('회원정보가 존재하지 않습니다.');
    }

    // userDetailId를 사용하여 프로필 이미지를 업데이트한다.
    const updatedProfileImage = await this.prisma.userDetail.update({
      where: { userDetailId: userDetail.userDetailId },
      data: { profileImg: profileImg },
    });
    return updatedProfileImage.profileImg;
  }
}
