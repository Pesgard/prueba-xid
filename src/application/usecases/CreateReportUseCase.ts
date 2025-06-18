import { injectable, inject } from 'inversify';
import { IFileRepository } from '../../domain/interfaces/IFileRepository';
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
    @inject(TYPES.IFileRepository) private fileRepository: IFileRepository
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