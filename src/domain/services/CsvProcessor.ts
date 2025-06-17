import { SalesItem } from '../entities/Report';

export interface CsvProcessor {
  parseCsv(csvContent: string): Promise<SalesItem[]>;
} 