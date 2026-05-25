import { env } from '../config/env.js';

export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  mime: string;
}

export async function uploadToS3(
  _buffer: Buffer,
  _filename: string,
  _mimetype: string
): Promise<string> {
  if (env.S3_ENDPOINT && env.S3_ACCESS_KEY) {
    throw new Error('S3 not configured - implement AWS SDK v3 S3 client here');
  }
  throw new Error('S3 storage not configured. Set S3_ENDPOINT, S3_ACCESS_KEY, and S3_SECRET_KEY in .env');
}
