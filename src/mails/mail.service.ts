// mail.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  private verificationCodes = new Map<number, number>(); // 숫자를 사용하여 인증 번호 관리

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  async sendMail(to: string, subject: string, req: Request) {
    try {
      const email = req.body.to;
      console.log('이메일 확인 샌드 메일:', email);

      const verificationCode = this.generateRandomNumber(10000, 99999); // 5자리 랜덤 인증 번호 생성
      console.log('인증 번호 확인 샌드 메일:', verificationCode);

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: `인증 번호: ${verificationCode}`,
      });

      this.verificationCodes.set(verificationCode, verificationCode);

      console.log('메일이 전송되었습니다');
    } catch (error) {
      console.error('메일 전송 중 오류가 발생했습니다:', error);
      // throw new Error('메일 전송 중 오류가 발생했습니다');
      throw new HttpException(
        '메일 전송 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  //인증번호 검증
  verifyVerificationCode(code: number): boolean {
    if (this.verificationCodes.has(code)) {
      this.verificationCodes.delete(code);
      return true;
    }
    return false;
  }
}
