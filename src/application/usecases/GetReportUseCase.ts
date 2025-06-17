import { injectable, inject } from 'inversify';
import { FileRepository } from '../../domain/repositories/FileRepository';
import { TYPES } from '../../config/types';

export interface GetReportRequest {
  reportId: string;
}

export interface GetReportResponse {
  status: 'ready' | 'processing' | 'not_found';
  downloadUrl?: string;
}

@injectable()
export class GetReportUseCase {
  constructor(
    @inject(TYPES.FileRepository) private fileRepository: FileRepository
  ) {}

  async execute(request: GetReportRequest): Promise<GetReportResponse> {
    try {
      const fileExists = await this.fileRepository.fileExists(request.reportId);
      
      if (!fileExists) {
        return { status: 'not_found' };
      }

      // If file exists, generate download URL
      const downloadResponse = await this.fileRepository.generateDownloadUrl(request.reportId);
      
      return {
        status: 'ready',
        downloadUrl: downloadResponse.downloadUrl
      };
    } catch (error) {
      // If there's an error checking the file, assume it's still processing
      return { status: 'processing' };
    }
  }
} 