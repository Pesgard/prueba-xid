import { injectable } from 'inversify';
import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IFileRepository, UploadUrlResponse, DownloadUrlResponse } from '../../domain/interfaces/IFileRepository';

@injectable()
export class AwsS3FileRepository implements IFileRepository {
  private s3Client: S3Client;
  private uploadsBucket: string;
  private resultsBucket: string;

  constructor() {
    this.s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
    this.uploadsBucket = process.env.UPLOADS_BUCKET!;
    this.resultsBucket = process.env.RESULTS_BUCKET!;
  }

  async generateUploadUrl(reportId: string, _fileName: string): Promise<UploadUrlResponse> {
    const key = `${reportId}.csv`;
    
    const command = new PutObjectCommand({
      Bucket: this.uploadsBucket,
      Key: key,
      ContentType: 'text/csv'
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return {
      reportId,
      uploadUrl
    };
  }

  async generateDownloadUrl(reportId: string): Promise<DownloadUrlResponse> {
    const key = `${reportId}.json`;
    
    const command = new GetObjectCommand({
      Bucket: this.resultsBucket,
      Key: key
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return {
      downloadUrl
    };
  }

  async fileExists(reportId: string): Promise<boolean> {
    try {
      const key = `${reportId}.json`;
      
      const command = new HeadObjectCommand({
        Bucket: this.resultsBucket,
        Key: key
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  async readFile(bucket: string, key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });

    const response = await this.s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('File content is empty');
    }

    return response.Body.transformToString();
  }

  async saveFile(bucket: string, key: string, content: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: content,
      ContentType: 'application/json'
    });

    await this.s3Client.send(command);
  }
} 