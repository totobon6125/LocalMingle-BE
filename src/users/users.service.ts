/* eslint-disable prettier/prettier */
// src/users/users.service.ts
import { BadRequestException, ConflictException,  Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { CreateUserDetailDto } from './dto/create-user-detail.dto';
// import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { IUsersServiceFindByEmail } from './interfaces/users-service.interface';



@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // todo: after heedragon
  async create(createUserDto: CreateUserDto): Promise<User> {
    /* Eric's code 
    // 이미 존재하는 유저인지 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new Error('이미 존재하는 유저입니다.');
    }
    // 새로운 user 생성
    const user = await this.prisma.user.create({
      data: createUserDto,
    });
  
    // 새로운 UserDetail 생성
    // const defaultUserDetail: CreateUserDetailDto = {
    //   nickname: 'default_nickname',  // 기본값 설정
    //   intro: 'default_intro',  // 기본값 설정
    //   profileImg: 'default.jpg URL',  // 기본값 설정
    // };
  
    // await this.prisma.userDetail.create({
    //   data: {
    //     ...defaultUserDetail,
    //     UserId: user.userId,
    //   },
    // });
  
    return user;
    */

    const { email, password, nickname, intro, confirmPassword, profileImg } = createUserDto;

    const user = await this.findByEmail({ email });
    if (user) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }
  // 리팩토링시 !== 로 변경
   if  (password != confirmPassword){
      throw new BadRequestException('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    }

   const hashedPassword = await bcrypt.hash(password, 10);

   return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        UserDetail: {
          create: {
            nickname,
            intro,
            profileImg,
          },
        }
      },
    });
  }
  

  // 전체 유저 리스트를 조회한다.
  async findAll() {
    return await this.prisma.user.findMany({});
  }

  // "TODO: implement me"
  /**
  findMe(id: number) {
    return `This action returns a #${id} user`;
  }
  **/

  // user와 연결된 가져온다
  async findOne(id: number) {
    return await this.prisma.user.findUnique({
      where: { userId: id },
    });
  }

  findByEmail({ email }: IUsersServiceFindByEmail): Promise<User> {
    // 이코드는 여러번 재사용 될 수 있기 떄문에 따로 빼줌
    return this.prisma.user.findUnique({ where: { email } });
  }

  // user 정보를 수정한다.
  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { userId: id },
      data: updateUserDto,
    });
  }

  // 회원 탈퇴를 한다.
  async remove(id: number) {
    return await this.prisma.user.delete({
      where: { userId: id },
    });
  }

  // 사용자가 생성한 모임(Event) 리스트를 조회한다. HostEvents
  async findHostedEvents(id: number) {
    return await this.prisma.user.findUnique({
      where: { userId: id },
      include: { HostEvents: true },
    });
  }

  // 사용자가 참가한 모임(Event) 리스트를 조회한다. GuestEvents의 guestId, eventId를 이용하여 Event를 찾는다.
  async findJoinedEvents(id: number) {
    return await this.prisma.user.findUnique({
      where: { userId: id },
      include: { GuestEvents: true },
    });
  }


  /* TODO: userDetail 
  // UserDetail 조회
  // async createUserDetail(createUserDetailDto: CreateUserDetailDto, id: number) {
  //     // 이미 존재하는 user detail 이 있는지 확인
  //     const existingUserDetail = await this.prisma.userDetail.findUnique({
  //       where: { UserId: id },
  //     });

  //     // 이미 존재하는 user detail 이 있는 경우
  //     if (existingUserDetail) {
  //       throw Error('이미 존재하는 user detail 입니다.');
  //     }

  //     // 존재하지 않는 경우
  //     return await this.prisma.userDetail.create({
  //       data: {
  //         ...createUserDetailDto,
  //         User: {
  //           connect: { userId: id },
  //         },
  //       },
  //     });
  // }

  // UserDetail를 조회한다.
  async findUserDetail(id: number) {
    return await this.prisma.userDetail.findUnique({
      where: { UserId: id },
    });
  }

  // UserDetail을 수정한다.
  async updateUserDetail(updateUserDetailDto: UpdateUserDetailDto, id: number) {
    // user를 찾는다.
    const existingUser = await this.prisma.user.findUnique({
      where: { userId: id },
    });

    // user가 존재하지 않는 경우
    if (!existingUser) {
      throw Error('존재하지 않는 user 입니다.');
    }

    // user가 존재하는 경우
    const user = await this.prisma.user.findUnique({
      where: { userId: id },
      include: { UserDetail: true },
    });

    // user에 연결될 userDetail를 불러와서 수정한다.
    return await this.prisma.userDetail.update({
      where: { UserId: id },
      data: {
        ...updateUserDetailDto,
      },
    }); 
  }
  */ 


}
