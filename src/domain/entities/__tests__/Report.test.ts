import { Report, SalesItem } from '../Report';

describe('Report', () => {
  describe('generateId', () => {
    it('should generate a valid UUID', () => {
      const id = Report.generateId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = Report.generateId();
      const id2 = Report.generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('validateSalesItem', () => {
    it('should validate a correct sales item', () => {
      const item = {
        product_id: '101',
        product_name: 'Test Product',
        quantity: 10,
        price: 99.99,
        total_price: 0
      };

      expect(Report.validateSalesItem(item)).toBe(true);
    });

    it('should reject item with missing fields', () => {
      const item = {
        product_id: '101',
        quantity: 10,
        price: 99.99
      };

      expect(Report.validateSalesItem(item)).toBe(false);
    });

    it('should reject item with invalid quantity', () => {
      const item = {
        product_id: '101',
        product_name: 'Test Product',
        quantity: -5,
        price: 99.99,
        total_price: 0
      };

      expect(Report.validateSalesItem(item)).toBe(false);
    });

    it('should reject item with invalid price', () => {
      const item = {
        product_id: '101',
        product_name: 'Test Product',
        quantity: 10,
        price: 0,
        total_price: 0
      };

      expect(Report.validateSalesItem(item)).toBe(false);
    });
  });

  describe('processItems', () => {
    it('should filter items with quantity > 10', () => {
      const items: SalesItem[] = [
        {
          product_id: '101',
          product_name: 'Low Quantity',
          quantity: 5,
          price: 100,
          total_price: 0
        },
        {
          product_id: '102',
          product_name: 'High Quantity',
          quantity: 15,
          price: 50,
          total_price: 0
        }
      ];

      const result = Report.processItems(items);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].product_id).toBe('102');
    });

    it('should calculate total_price correctly', () => {
      const items: SalesItem[] = [
        {
          product_id: '102',
          product_name: 'Test Product',
          quantity: 15,
          price: 50,
          total_price: 0
        }
      ];

      const result = Report.processItems(items);

      expect(result.items[0].total_price).toBe(750);
    });

    it('should calculate summary correctly', () => {
      const items: SalesItem[] = [
        {
          product_id: '102',
          product_name: 'Product 1',
          quantity: 15,
          price: 50,
          total_price: 0
        },
        {
          product_id: '103',
          product_name: 'Product 2',
          quantity: 20,
          price: 30,
          total_price: 0
        }
      ];

      const result = Report.processItems(items);

      expect(result.summary.totalItems).toBe(2);
      expect(result.summary.grandTotal).toBe(1350); // 750 + 600
    });

    it('should include metadata', () => {
      const items: SalesItem[] = [
        {
          product_id: '102',
          product_name: 'Test Product',
          quantity: 15,
          price: 50,
          total_price: 0
        }
      ];

      const result = Report.processItems(items);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.reportId).toBeDefined();
      expect(result.metadata.processedAt).toBeInstanceOf(Date);
    });
  });
}); 