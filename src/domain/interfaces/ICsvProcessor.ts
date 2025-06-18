import { SalesItem } from '../entities/Report';

export interface ICsvProcessor {
  parseCsv(csvContent: string): Promise<SalesItem[]>;
} 