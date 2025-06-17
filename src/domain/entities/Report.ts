import { v4 as uuidv4 } from 'uuid';

export interface ReportMetadata {
  reportId: string;
  processedAt: Date;
}

export interface SalesItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total_price: number;
}

export interface ReportSummary {
  totalItems: number;
  grandTotal: number;
}

export interface ProcessedReport {
  metadata: ReportMetadata;
  items: SalesItem[];
  summary: ReportSummary;
}

export class Report {
  constructor(
    public readonly reportId: string,
    public readonly createdAt: Date = new Date()
  ) {}

  static generateId(): string {
    return uuidv4();
  }

  static processItems(items: SalesItem[]): ProcessedReport {
    const filteredItems = items.filter(item => item.quantity > 10);
    
    const processedItems = filteredItems.map(item => ({
      ...item,
      total_price: item.quantity * item.price
    }));

    const summary: ReportSummary = {
      totalItems: processedItems.length,
      grandTotal: processedItems.reduce((sum, item) => sum + item.total_price, 0)
    };

    return {
      metadata: {
        reportId: this.generateId(),
        processedAt: new Date()
      },
      items: processedItems,
      summary
    };
  }

  static validateSalesItem(item: any): item is SalesItem {
    return (
      typeof item.product_id === 'string' &&
      typeof item.product_name === 'string' &&
      typeof item.quantity === 'number' &&
      typeof item.price === 'number' &&
      item.quantity > 0 &&
      item.price > 0
    );
  }
} 