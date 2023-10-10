import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    // 사용자 데이터 생성 예제
    const user1 = await prisma.user.create({
      data: {
        email: 'user1@example.com',
        password: 'password123', // 실제로는 해싱된 비밀번호를 사용해야 합니다.
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'user2@example.com',
        password: 'password456',
      },
    });

    const user3 = await prisma.user.create({
      data: {
        email: 'user3@example.com',
        password: 'password456',
      },
    });

    // 사용자 상세 정보 데이터 생성 예제
    const userDetail1 = await prisma.userDetail.create({
      data: {
        UserId: user1.userId,
        nickname: 'User1Nickname',
      },
    });

    const userDetail2 = await prisma.userDetail.create({
      data: {
        UserId: user2.userId,
        nickname: 'User2Nickname',
      },
    });

    const userDetail3 = await prisma.userDetail.create({
      data: {
        UserId: user3.userId,
        nickname: 'User3Nickname',
      },
    });

    console.log(user1, user2, user3, userDetail1, userDetail2, userDetail3);
  } catch (error) {
    console.error('Error creating seed data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
