export interface UploadUrlResponse {
  uploadUrl: string;
  reportId: string;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
}

export interface IFileRepository {
  generateUploadUrl(reportId: string, fileName: string): Promise<UploadUrlResponse>;
  generateDownloadUrl(reportId: string): Promise<DownloadUrlResponse>;
  fileExists(reportId: string): Promise<boolean>;
  readFile(bucket: string, key: string): Promise<string>;
  saveFile(bucket: string, key: string, content: string): Promise<void>;
} 