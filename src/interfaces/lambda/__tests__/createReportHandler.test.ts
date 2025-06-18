import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler } from '../createReportHandler';
import { container } from '../../../config/container';
import { CreateReportUseCase } from '../../../application/usecases/CreateReportUseCase';
import { TYPES } from '../../../config/types';

// Mock the container
jest.mock('../../../config/container');

describe('createReportHandler', () => {
  let mockCreateReportUseCase: jest.Mocked<CreateReportUseCase>;
  let mockContainer: jest.Mocked<typeof container>;

  beforeEach(() => {
    mockCreateReportUseCase = {
      execute: jest.fn(),
    } as any;

    mockContainer = container as jest.Mocked<typeof container>;
    mockContainer.get = jest.fn().mockReturnValue(mockCreateReportUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockEvent = (body?: any): APIGatewayProxyEvent => ({
    body: body ? JSON.stringify(body) : null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/reports',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  });

  describe('handler', () => {
    it('should create a report successfully', async () => {
      // Arrange
      const event = createMockEvent({ fileName: 'test-sales.csv' });
      const mockResponse = {
        reportId: 'test-report-id',
        uploadUrl: 'https://s3.amazonaws.com/upload-url',
      };

      mockCreateReportUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await handler(event) as APIGatewayProxyResult;

      // Assert
      expect(mockContainer.get).toHaveBeenCalledWith(TYPES.CreateReportUseCase);
      expect(mockCreateReportUseCase.execute).toHaveBeenCalledWith({
        fileName: 'test-sales.csv',
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockResponse);
      expect(result.headers?.['Content-Type']).toBe('application/json');
      expect(result.headers?.['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should use default filename when not provided', async () => {
      // Arrange
      const event = createMockEvent({});
      const mockResponse = {
        reportId: 'test-report-id',
        uploadUrl: 'https://s3.amazonaws.com/upload-url',
      };

      mockCreateReportUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      await handler(event);

      // Assert
      expect(mockCreateReportUseCase.execute).toHaveBeenCalledWith({
        fileName: 'sales-data.csv',
      });
    });

    it('should handle empty body', async () => {
      // Arrange
      const event = createMockEvent();
      const mockResponse = {
        reportId: 'test-report-id',
        uploadUrl: 'https://s3.amazonaws.com/upload-url',
      };

      mockCreateReportUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      await handler(event);

      // Assert
      expect(mockCreateReportUseCase.execute).toHaveBeenCalledWith({
        fileName: 'sales-data.csv',
      });
    });

    it('should handle use case errors', async () => {
      // Arrange
      const event = createMockEvent({ fileName: 'test-sales.csv' });
      const error = new Error('S3 service error');

      mockCreateReportUseCase.execute.mockRejectedValue(error);

      // Act
      const result = await handler(event) as APIGatewayProxyResult;

      // Assert
      expect(result.statusCode).toBe(500);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toBe('Internal server error');
      expect(responseBody.message).toBe('S3 service error');
      expect(result.headers?.['Content-Type']).toBe('application/json');
      expect(result.headers?.['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      const event = createMockEvent({ fileName: 'test-sales.csv' });
      const error = 'Unknown error type';

      mockCreateReportUseCase.execute.mockRejectedValue(error);

      // Act
      const result = await handler(event) as APIGatewayProxyResult;

      // Assert
      expect(result.statusCode).toBe(500);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toBe('Internal server error');
      expect(responseBody.message).toBe('Unknown error');
    });
  });
}); 