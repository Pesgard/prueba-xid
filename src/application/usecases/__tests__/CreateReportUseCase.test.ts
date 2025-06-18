import { CreateReportUseCase } from '../CreateReportUseCase';
import { IFileRepository } from '../../../domain/interfaces/IFileRepository';
import { Report } from '../../../domain/entities/Report';

describe('CreateReportUseCase', () => {
  let useCase: CreateReportUseCase;
  let mockFileRepository: jest.Mocked<IFileRepository>;

  beforeEach(() => {
    mockFileRepository = {
      generateUploadUrl: jest.fn(),
      generateDownloadUrl: jest.fn(),
      fileExists: jest.fn(),
      readFile: jest.fn(),
      saveFile: jest.fn(),
    };

    useCase = new CreateReportUseCase(mockFileRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a report and return upload URL', async () => {
      // Arrange
      const request = { fileName: 'test-sales.csv' };
      const mockReportId = 'test-report-id';
      const mockUploadUrl = 'https://s3.amazonaws.com/upload-url';

      jest.spyOn(Report, 'generateId').mockReturnValue(mockReportId);
      mockFileRepository.generateUploadUrl.mockResolvedValue({
        reportId: mockReportId,
        uploadUrl: mockUploadUrl,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(Report.generateId).toHaveBeenCalledTimes(1);
      expect(mockFileRepository.generateUploadUrl).toHaveBeenCalledWith(
        mockReportId,
        request.fileName
      );
      expect(result).toEqual({
        reportId: mockReportId,
        uploadUrl: mockUploadUrl,
      });
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const request = { fileName: 'test-sales.csv' };
      const error = new Error('S3 error');

      jest.spyOn(Report, 'generateId').mockReturnValue('test-id');
      mockFileRepository.generateUploadUrl.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow('S3 error');
    });
  });
}); 