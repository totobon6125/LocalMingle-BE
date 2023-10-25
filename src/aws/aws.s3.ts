// src/aws/aws.s3.ts
import * as AWS from 'aws-sdk';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class AwsS3Service {
  private s3;
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  // S3 프로필 이미지 업로드 로직
  async uploadFile(file) {
    // 이미지 파일 Validation 체크
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const SUPPORTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
    if (!file) {
      throw new NotFoundException('이미지 파일을 선택해주세요.');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('파일 크기는 5MB를 초과할 수 없습니다.');
    }
    if (!SUPPORTED_FILE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        '지원되는 파일 형식은 JPEG, PNG, GIF 뿐입니다.'
      );
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || 's3-image-local-mingle', // AWS S3 버킷 이름
      Key: `profileImg/${String(Date.now())}`, // 폴더와 파일 이름
      Body: file.buffer, // 파일 내용
      ContentType: file.mimetype, // 파일 타입
    };

    return new Promise((resolve, reject) => {
      this.s3.upload(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }

  // S3 이벤트 이미지 업로드
  async uploadEventFile(file) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || 'aws-s3-local-mingle', // AWS S3 버킷 이름
      Key: `eventImg/${String(Date.now())}`, // 폴더와 파일 이름
      Body: file.buffer, // 파일 내용
      ContentType: file.mimetype, // 파일 타입
    };

    return new Promise((resolve, reject) => {
      this.s3.upload(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }
}
