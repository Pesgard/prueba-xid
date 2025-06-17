import { injectable, inject } from 'inversify';
import { FileRepository } from '../../domain/repositories/FileRepository';
import { Report } from '../../domain/entities/Report';
import { TYPES } from '../../config/types';

export interface CreateReportRequest {
  fileName: string;
}

export interface CreateReportResponse {
  reportId: string;
  uploadUrl: string;
}

@injectable()
export class CreateReportUseCase {
  constructor(
    @inject(TYPES.FileRepository) private fileRepository: FileRepository
  ) {}

  async execute(request: CreateReportRequest): Promise<CreateReportResponse> {
    const reportId = Report.generateId();
    
    const uploadResponse = await this.fileRepository.generateUploadUrl(
      reportId,
      request.fileName
    );

    return {
      reportId: uploadResponse.reportId,
      uploadUrl: uploadResponse.uploadUrl
    };
  }
} 