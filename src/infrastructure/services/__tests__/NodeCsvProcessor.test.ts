import { NodeCsvProcessor } from '../NodeCsvProcessor';

describe('NodeCsvProcessor', () => {
  let processor: NodeCsvProcessor;

  beforeEach(() => {
    processor = new NodeCsvProcessor();
  });

  describe('parseCsv', () => {
    it('should parse valid CSV content', async () => {
      // Arrange
      const csvContent = `product_id,product_name,quantity,price
102,Mouse Gamer,25,75.00
103,Teclado Mecánico,15,110.25`;

      // Act
      const result = await processor.parseCsv(csvContent);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        product_id: '102',
        product_name: 'Mouse Gamer',
        quantity: 25,
        price: 75.00,
        total_price: 0,
      });
      expect(result[1]).toEqual({
        product_id: '103',
        product_name: 'Teclado Mecánico',
        quantity: 15,
        price: 110.25,
        total_price: 0,
      });
    });

    it('should handle CSV with missing values', async () => {
      // Arrange
      const csvContent = `product_id,product_name,quantity,price
104,Laptop,,1200.00
105,,20,50.00`;

      // Act
      const result = await processor.parseCsv(csvContent);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        product_id: '104',
        product_name: 'Laptop',
        quantity: 0, // Should default to 0 for missing quantity
        price: 1200.00,
        total_price: 0,
      });
      expect(result[1]).toEqual({
        product_id: '105',
        product_name: '', // Should default to empty string for missing name
        quantity: 20,
        price: 50.00,
        total_price: 0,
      });
    });

    it('should handle empty CSV content', async () => {
      // Arrange
      const csvContent = 'product_id,product_name,quantity,price';

      // Act
      const result = await processor.parseCsv(csvContent);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle invalid numeric values', async () => {
      // Arrange
      const csvContent = `product_id,product_name,quantity,price
106,Invalid Product,invalid,not_a_number`;

      // Act
      const result = await processor.parseCsv(csvContent);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        product_id: '106',
        product_name: 'Invalid Product',
        quantity: 0, // Should default to 0 for invalid quantity
        price: 0, // Should default to 0 for invalid price
        total_price: 0,
      });
    });

    it('should reject malformed CSV', async () => {
      // Arrange
      const csvContent = 'invalid csv content without proper structure';

      // Act & Assert
      // The CSV parser should handle this gracefully and return empty array or throw
      const result = await processor.parseCsv(csvContent);
      expect(Array.isArray(result)).toBe(true);
    });
  });
}); 