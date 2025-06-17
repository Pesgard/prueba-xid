import { injectable } from 'inversify';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { CsvProcessor } from '../../domain/services/CsvProcessor';
import { SalesItem } from '../../domain/entities/Report';

@injectable()
export class CsvProcessorImpl implements CsvProcessor {
  async parseCsv(csvContent: string): Promise<SalesItem[]> {
    return new Promise((resolve, reject) => {
      const results: SalesItem[] = [];
      const stream = Readable.from([csvContent]);

      stream
        .pipe(csv())
        .on('data', (data: any) => {
          try {
            const item: SalesItem = {
              product_id: data.product_id?.toString() || '',
              product_name: data.product_name?.toString() || '',
              quantity: parseFloat(data.quantity) || 0,
              price: parseFloat(data.price) || 0,
              total_price: 0 // Will be calculated later
            };
            results.push(item);
          } catch (error) {
            console.error('Error parsing CSV row:', error);
          }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error: Error) => {
          reject(error);
        });
    });
  }
} 