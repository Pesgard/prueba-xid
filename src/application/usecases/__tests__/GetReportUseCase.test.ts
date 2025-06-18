import { GetReportUseCase } from '../GetReportUseCase';
import { IFileRepository } from '../../../domain/interfaces/IFileRepository';

describe('GetReportUseCase', () => {
  let useCase: GetReportUseCase;
  let mockFileRepository: jest.Mocked<IFileRepository>;

  beforeEach(() => {
    mockFileRepository = {
      generateUploadUrl: jest.fn(),
      generateDownloadUrl: jest.fn(),
      fileExists: jest.fn(),
      readFile: jest.fn(),
      saveFile: jest.fn(),
    };

    useCase = new GetReportUseCase(mockFileRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return ready status with download URL when file exists', async () => {
      // Arrange
      const request = { reportId: 'test-report-id' };
      const mockDownloadUrl = 'https://s3.amazonaws.com/download-url';

      mockFileRepository.fileExists.mockResolvedValue(true);
      mockFileRepository.generateDownloadUrl.mockResolvedValue({
        downloadUrl: mockDownloadUrl,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(mockFileRepository.fileExists).toHaveBeenCalledWith(request.reportId);
      expect(mockFileRepository.generateDownloadUrl).toHaveBeenCalledWith(request.reportId);
      expect(result).toEqual({
        status: 'ready',
        downloadUrl: mockDownloadUrl,
      });
    });

    it('should return not_found status when file does not exist', async () => {
      // Arrange
      const request = { reportId: 'non-existent-report' };

      mockFileRepository.fileExists.mockResolvedValue(false);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(mockFileRepository.fileExists).toHaveBeenCalledWith(request.reportId);
      expect(mockFileRepository.generateDownloadUrl).not.toHaveBeenCalled();
      expect(result).toEqual({
        status: 'not_found',
      });
    });

    it('should return processing status when there is an error', async () => {
      // Arrange
      const request = { reportId: 'test-report-id' };
      const error = new Error('S3 error');

      mockFileRepository.fileExists.mockRejectedValue(error);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(mockFileRepository.fileExists).toHaveBeenCalledWith(request.reportId);
      expect(result).toEqual({
        status: 'processing',
      });
    });
  });
}); 