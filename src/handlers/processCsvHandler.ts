import { S3Event } from 'aws-lambda';
import { container } from '../config/container';
import { ProcessCsvUseCase } from '../application/usecases/ProcessCsvUseCase';
import { TYPES } from '../config/types';

export async function handler(event: S3Event): Promise<void> {
  try {
    const processCsvUseCase = container.get<ProcessCsvUseCase>(TYPES.ProcessCsvUseCase);
    
    // Process each S3 record
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      
      console.log(`Processing file: ${key} from bucket: ${bucket}`);
      
      await processCsvUseCase.execute({
        bucket,
        key
      });
    }
  } catch (error) {
    console.error('Error in processCsvHandler:', error);
    throw error; // Re-throw to trigger Lambda retry mechanism
  }
} 