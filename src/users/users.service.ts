import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { IUsersServiceFindByEmail } from './interfaces/users-service.interface';
import { User } from '@prisma/client';
/* eslint-disable prettier/prettier */
// src/users/users.service.ts
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { CreateUserDetailDto } from './dto/create-user-detail.dto';
// import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { IUsersServiceFindByEmail } from './interfaces/users-service.interface';

@Injectable()
export class UsersService {
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
