import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { sign } from 'jsonwebtoken'; // 'jsonwebtoken' 모듈을 추가로 임포트
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

  createEmailVerifyToken = (email) => {
    const token = sign({ email: email }, process.env.PRIVATE_KEY, {
      expiresIn: '7d',
    });

    return token;
  };

  async sendMail(to: string, subject: string, content: string, req: Request) {
    try {
      const email = req.body.to; // 이메일을 req.body에서 가져옵니다.
      console.log('이메일확인샌드메일:', email);

      const token = this.createEmailVerifyToken(email);
      console.log('토큰확인샌드메일:', token);

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email, //to 대신 email사용
        subject: subject,
        html: `<h3>링크를 클릭해서 이메일을 인증하세요</h3>
        <h3> <a href="http://localhost:3000/email/?send=${email}&token=${token}">이메일 인증하기</a></h3>
        <h3>1시간 뒤 링크가 만료됩니다</h3>`,
      });

      console.log('메일이 전송되었습니다');
    } catch (error) {
      console.error('메일 전송 중 오류가 발생했습니다:', error);
    }
  }
}
