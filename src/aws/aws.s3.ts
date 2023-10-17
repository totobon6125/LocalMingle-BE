// src/aws/aws.s3.ts
import * as AWS from 'aws-sdk';
import { BadRequestException, Injectable } from '@nestjs/common';

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

  // S3 업로드 로직
  async uploadFile(file) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
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
}
