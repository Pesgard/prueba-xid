import { ProcessCsvUseCase } from '../ProcessCsvUseCase';
import { IFileRepository } from '../../../domain/interfaces/IFileRepository';
import { ICsvProcessor } from '../../../domain/interfaces/ICsvProcessor';
import { SalesItem } from '../../../domain/entities/Report';

describe('ProcessCsvUseCase', () => {
  let useCase: ProcessCsvUseCase;
  let mockFileRepository: jest.Mocked<IFileRepository>;
  let mockCsvProcessor: jest.Mocked<ICsvProcessor>;

  beforeEach(() => {
    mockFileRepository = {
      generateUploadUrl: jest.fn(),
      generateDownloadUrl: jest.fn(),
      fileExists: jest.fn(),
      readFile: jest.fn(),
      saveFile: jest.fn(),
    };

    mockCsvProcessor = {
      parseCsv: jest.fn(),
    };

    useCase = new ProcessCsvUseCase(mockFileRepository, mockCsvProcessor);

    // Mock environment variable
    process.env.RESULTS_BUCKET = 'test-results-bucket';
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.RESULTS_BUCKET;
  });

  describe('execute', () => {
    it('should process CSV file successfully', async () => {
      // Arrange
      const request = { bucket: 'test-bucket', key: 'test-report-id.csv' };
      const csvContent = 'product_id,product_name,quantity,price\n102,Mouse,25,75.00';
      
      const mockSalesItems: SalesItem[] = [
        {
          product_id: '102',
          product_name: 'Mouse',
          quantity: 25,
          price: 75.00,
          total_price: 0,
        },
      ];

      mockFileRepository.readFile.mockResolvedValue(csvContent);
      mockCsvProcessor.parseCsv.mockResolvedValue(mockSalesItems);
      mockFileRepository.saveFile.mockResolvedValue();

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockFileRepository.readFile).toHaveBeenCalledWith(
        request.bucket,
        request.key
      );
      expect(mockCsvProcessor.parseCsv).toHaveBeenCalledWith(csvContent);
      expect(mockFileRepository.saveFile).toHaveBeenCalledWith(
        'test-results-bucket',
        'test-report-id.json',
        expect.stringMatching(/"reportId":\s*"test-report-id"/)
      );
    });

    it('should filter out invalid items', async () => {
      // Arrange
      const request = { bucket: 'test-bucket', key: 'test-report-id.csv' };
      const csvContent = 'product_id,product_name,quantity,price\n101,Laptop,5,1200.00\n102,Mouse,25,75.00';
      
      const mockSalesItems: SalesItem[] = [
        {
          product_id: '101',
          product_name: 'Laptop',
          quantity: 5, // This should be filtered out (quantity <= 10)
          price: 1200.00,
          total_price: 0,
        },
        {
          product_id: '102',
          product_name: 'Mouse',
          quantity: 25,
          price: 75.00,
          total_price: 0,
        },
      ];

      mockFileRepository.readFile.mockResolvedValue(csvContent);
      mockCsvProcessor.parseCsv.mockResolvedValue(mockSalesItems);
      mockFileRepository.saveFile.mockResolvedValue();

      // Act
      await useCase.execute(request);

      // Assert
      const saveFileCall = mockFileRepository.saveFile.mock.calls[0];
      const savedContent = JSON.parse(saveFileCall[2]);
      
      expect(savedContent.items).toHaveLength(1);
      expect(savedContent.items[0].product_id).toBe('102');
      expect(savedContent.summary.totalItems).toBe(1);
    });

    it('should handle processing errors', async () => {
      // Arrange
      const request = { bucket: 'test-bucket', key: 'test-report-id.csv' };
      const error = new Error('CSV parsing error');

      mockFileRepository.readFile.mockResolvedValue('invalid csv');
      mockCsvProcessor.parseCsv.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow('CSV parsing error');
    });
  });
}); 