import { injectable, inject } from 'inversify';
import { IFileRepository } from '../../domain/interfaces/IFileRepository';
import { ICsvProcessor } from '../../domain/interfaces/ICsvProcessor';
import { Report } from '../../domain/entities/Report';
import { TYPES } from '../../config/types';

export interface ProcessCsvRequest {
  bucket: string;
  key: string;
}

@injectable()
export class ProcessCsvUseCase {
  constructor(
    @inject(TYPES.IFileRepository) private fileRepository: IFileRepository,
    @inject(TYPES.ICsvProcessor) private csvProcessor: ICsvProcessor
  ) {}

  async execute(request: ProcessCsvRequest): Promise<void> {
    try {
      // Read CSV file from S3
      const csvContent = await this.fileRepository.readFile(request.bucket, request.key);
      
      // Parse CSV content
      const salesItems = await this.csvProcessor.parseCsv(csvContent);
      
      // Validate items
      const validItems = salesItems.filter(item => Report.validateSalesItem(item));
      
      // Process items (filter and calculate)
      const processedReport = Report.processItems(validItems);
      
      // Extract reportId from the file key (assuming format: reportId.csv)
      const reportId = request.key.split('.')[0];
      
      // Update metadata with correct reportId
      processedReport.metadata.reportId = reportId;
      
      // Save processed result to results bucket
      const resultKey = `${reportId}.json`;
      const resultsBucket = process.env.RESULTS_BUCKET!;
      
      await this.fileRepository.saveFile(
        resultsBucket,
        resultKey,
        JSON.stringify(processedReport, null, 2)
      );
      
      console.log(`Successfully processed report ${reportId}`);
    } catch (error) {
      console.error('Error processing CSV:', error);
      throw error;
    }
  }
} 