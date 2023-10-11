import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { IUsersServiceFindByEmail } from './interfaces/users-service.interface';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail({ email }: IUsersServiceFindByEmail): Promise<User> {
    // 이코드는 여러번 재사용 될 수 있기 떄문에 따로 빼줌
    return this.prisma.user.findUnique({ where: { email } });
  }

  findOne(userId: number) {
    // 이코드는 여러번 재사용 될 수 있기 떄문에 따로 빼줌
    return this.prisma.user.findUnique({ where: { userId } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, nickname, intro, confirm, profileImg } =
      createUserDto;

    const user = await this.findByEmail({ email });

    if (user) {
      throw new ConflictException('이미 등록된 이메일 입니다.');
    }

    if (password !== confirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      );
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
        },
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }
}
