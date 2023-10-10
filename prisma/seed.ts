// // // prisma/seed.ts

// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// async function main() {
//   // 1. 카테고리 생성
//   const [category1, category2] = await Promise.all([
//     prisma.category.create({
//       data: {
//         name: 'category1',
//       },
//     }),
//     prisma.category.create({
//       data: {
//         name: 'category2',
//       },
//     }),
//   ]);

//   // 2. 이벤트 생성
//   const [event1, event2, event3, event4] = await Promise.all([
//     prisma.event.create({
//       data: {
//         eventName: 'event1',
//         maxSize: 10,
//         eventDate: new Date(),
//         signupStartDate: new Date(),
//         signupEndDate: new Date(),
//         eventLocation: 'event1 location',
//         content: 'event1 content',
//         isVerified: true,
//         CategoryId: category1.categoryId, // 카테고리 ID 참조
//       },
//     }),
//     prisma.event.create({
//       data: {
//         eventName: 'event2',
//         maxSize: 20,
//         eventDate: new Date(),
//         signupStartDate: new Date(),
//         signupEndDate: new Date(),
//         eventLocation: 'event2 location',
//         content: 'event2 content',
//         isVerified: false,
//         CategoryId: category2.categoryId, // 카테고리 ID 참조
//       },
//     }),
//     prisma.event.create({
//       data: {
//         eventName: 'event3',
//         maxSize: 15,
//         eventDate: new Date(),
//         signupStartDate: new Date(),
//         signupEndDate: new Date(),
//         eventLocation: 'event3 location',
//         content: 'event3 content',
//         isVerified: true,
//         CategoryId: category2.categoryId, // 카테고리 ID 참조
//       },
//     }),
//     prisma.event.create({
//       data: {
//         eventName: 'event4',
//         maxSize: 25,
//         eventDate: new Date(),
//         signupStartDate: new Date(),
//         signupEndDate: new Date(),
//         eventLocation: 'event4 location',
//         content: 'event4 content',
//         isVerified: false,
//         CategoryId: category1.categoryId, // 카테고리 ID 참조
//       },
//     }),
//   ]);

//   // 3. 사용자, 사용자 상세 정보, 호스트 이벤트, 게스트 이벤트 생성
//   const [user1, user2, user3, user4] = await Promise.all([
//     prisma.user.upsert({
//       where: { email: 'user1@example.com' },
//       update: {},
//       create: {
//         email: 'user1@example.com',
//         password: 'password1',
//         UserDetail: {
//           create: {
//             nickname: 'nickname1',
//             intro: 'Hello, this is user1.',
//             profileImg: 'profile1.jpg',
//           },
//         },
//         HostEvents: {
//           create: [
//             { EventId: event1.eventId },
//             { EventId: event3.eventId },
//           ],
//         },
//         GuestEvents: {
//           create: [
//             { EventId: event2.eventId },
//             { EventId: event4.eventId },
//           ],
//         },
//       },
//     }),
//     prisma.user.upsert({
//       where: { email: 'user2@example.com' },
//       update: {},
//       create: {
//         email: 'user2@example.com',
//         password: 'password2',
//         UserDetail: {
//           create: {
//             nickname: 'nickname2',
//             intro: 'Hello, this is user2.',
//             profileImg: 'profile2.jpg',
//           },
//         },
//         HostEvents: {
//           create: [
//             { EventId: event2.eventId },
//             { EventId: event4.eventId },
//           ],
//         },
//         GuestEvents: {
//           create: [
//             { EventId: event1.eventId },
//             { EventId: event3.eventId },
//           ],
//         },
//       },
//     }),
//     // user3은 호스트만 함
//     prisma.user.upsert({
//       where: { email: 'user3@example.com' },
//       update: {},
//       create: {
//         email: 'user3@example.com',
//         password: 'password3',
//         UserDetail: {
//           create: {
//             nickname: 'nickname3',
//             intro: 'Hello, this is user3.',
//             profileImg: 'profile3.jpg',
//           },
//         },
//         HostEvents: {
//           create: [
//             { EventId: event1.eventId },
//             { EventId: event2.eventId },
//           ],
//         },
//       },
//     }),
//     // user4는 게스트만 함
//     prisma.user.upsert({
//       where: { email: 'user4@example.com' },
//       update: {},
//       create: {
//         email: 'user4@example.com',
//         password: 'password4',
//         UserDetail: {
//           create: {
//             nickname: 'nickname4',
//             intro: 'Hello, this is user4.',
//             profileImg: 'profile4.jpg',
//           },
//         },
//         GuestEvents: {
//           create: [
//             { EventId: event3.eventId },
//             { EventId: event4.eventId },
//           ],
//         },
//       },
//     }),
//   ]);

//   console.log({ user1, user2, user3, user4, event1, event2, event3, event4 });
// }


// main()
//   .catch((e) => {
//     throw e;
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// async function main() {
//   // 1. 카테고리 생성
//   const [category1, category2] = await Promise.all([
//     prisma.category.create({
//       data: {
//         name: 'category1',
//       },
//     }),
//     prisma.category.create({
//       data: {
//         name: 'category2',
//       },
//     }),
//   ]);

//   // 2. 이벤트 생성
//   const [event1, event2, event3, event4] = await Promise.all([
//     prisma.event.create({
//       data: {
//         eventName: 'event1',
//         maxSize: 10,
//         eventDate: new Date(),
//         signupStartDate: new Date(),
//         signupEndDate: new Date(),
//         eventLocation: 'event1 location',
//         content: 'event1 content',
//         isVerified: true,
//         CategoryId: category1.categoryId, // 카테고리 ID 참조
//       },
//     }),
//     prisma.event.create({
//       data: {
//         eventName: 'event2',
//         maxSize: 20,
//         eventDate: new Date(),
//         signupStartDate: new Date(),
//         signupEndDate: new Date(),
//         eventLocation: 'event2 location',
//         content: 'event2 content',
//         isVerified: false,
//         CategoryId: category2.categoryId, // 카테고리 ID 참조
//       },
//     }),
//     prisma.event.create({
//       data: {
//         eventName: 'event3',
//         maxSize: 15,
//         eventDate: new Date(),
//         signupStartDate: new Date(),
//         signupEndDate: new Date(),
//         eventLocation: 'event3 location',
//         content: 'event3 content',
//         isVerified: true,
//         CategoryId: category2.categoryId, // 카테고리 ID 참조
//       },
//     }),
//     prisma.event.create({
//       data: {
//         eventName: 'event4',
//         maxSize: 25,
//         eventDate: new Date(),
//         signupStartDate: new Date(),
//         signupEndDate: new Date(),
//         eventLocation: 'event4 location',
//         content: 'event4 content',
//         isVerified: false,
//         CategoryId: category1.categoryId, // 카테고리 ID 참조
//       },
//     }),
//   ]);

//   // 3. 사용자, 사용자 상세 정보, 호스트 이벤트, 게스트 이벤트 생성
//   const [user1, user2, user3, user4] = await Promise.all([
//     prisma.user.upsert({
//       where: { email: 'user1@example.com' },
//       update: {},
//       create: {
//         email: 'user1@example.com',
//         password: 'password1',
//         UserDetail: {
//           create: {
//             nickname: 'nickname1',
//             intro: 'Hello, this is user1.',
//             profileImg: 'profile1.jpg',
//           },
//         },
//         HostEvents: {
//           create: [
//             { EventId: event1.eventId },
//             { EventId: event3.eventId },
//           ],
//         },
//         GuestEvents: {
//           create: [
//             { EventId: event2.eventId },
//             { EventId: event4.eventId },
//           ],
//         },
//       },
//     }),
//     prisma.user.upsert({
//       where: { email: 'user2@example.com' },
//       update: {},
//       create: {
//         email: 'user2@example.com',
//         password: 'password2',
//         UserDetail: {
//           create: {
//             nickname: 'nickname2',
//             intro: 'Hello, this is user2.',
//             profileImg: 'profile2.jpg',
//           },
//         },
//         HostEvents: {
//           create: [
//             { EventId: event2.eventId },
//             { EventId: event4.eventId },
//           ],
//         },
//         GuestEvents: {
//           create: [
//             { EventId: event1.eventId },
//             { EventId: event3.eventId },
//           ],
//         },
//       },
//     }),
//     // user3은 호스트만 함
//     prisma.user.upsert({
//       where: { email: 'user3@example.com' },
//       update: {},
//       create: {
//         email: 'user3@example.com',
//         password: 'password3',
//         UserDetail: {
//           create: {
//             nickname: 'nickname3',
//             intro: 'Hello, this is user3.',
//             profileImg: 'profile3.jpg',
//           },
//         },
//         HostEvents: {
//           create: [
//             { EventId: event1.eventId },
//             { EventId: event2.eventId },
//           ],
//         },
//       },
//     }),
//     // user4는 게스트만 함
//     prisma.user.upsert({
//       where: { email: 'user4@example.com' },
//       update: {},
//       create: {
//         email: 'user4@example.com',
//         password: 'password4',
//         UserDetail: {
//           create: {
//             nickname: 'nickname4',
//             intro: 'Hello, this is user4.',
//             profileImg: 'profile4.jpg',
//           },
//         },
//         GuestEvents: {
//           create: [
//             { EventId: event3.eventId },
//             { EventId: event4.eventId },
//           ],
//         },
//       },
//     }),
//   ]);

//   console.log({ user1, user2, user3, user4, event1, event2, event3, event4 });
// }


// main()
//   .catch((e) => {
//     throw e;
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

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
