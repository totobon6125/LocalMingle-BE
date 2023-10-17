import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Request } from 'express'; // Express의 Request 객체를 사용하기 위해 추가

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // SMTP 설정
      host: 'smtp.gmail.com', //smtp 호스트
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // 랜덤한 인증 번호 생성 함수
  generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  async sendMail(to: string, subject: string, req: Request) {
    try {
      const email = req.body.to;
      console.log('이메일 확인 샌드 메일:', email);

      const verificationCode = this.generateRandomNumber(10000, 99999); // 5자리 랜덤 인증 번호 생성
      console.log('인증 번호 확인 샌드 메일:', verificationCode);

      // 이메일 내용에 인증 번호 포함
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: `인증 번호: ${verificationCode}`,
      });

      console.log('메일이 전송되었습니다');
    } catch (error) {
      console.error('메일 전송 중 오류가 발생했습니다:', error);
    }
  }
}
