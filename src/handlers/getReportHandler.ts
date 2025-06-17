import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { container } from '../config/container';
import { GetReportUseCase } from '../application/usecases/GetReportUseCase';
import { TYPES } from '../config/types';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const getReportUseCase = container.get<GetReportUseCase>(TYPES.GetReportUseCase);
    
    // Extract reportId from path parameters
    const reportId = event.pathParameters?.reportId;
    
    if (!reportId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'reportId is required'
        })
      };
    }
    
    // Execute use case
    const result = await getReportUseCase.execute({ reportId });
    
    // Determine response based on status
    let statusCode: number;
    switch (result.status) {
      case 'ready':
        statusCode = 200;
        break;
      case 'processing':
        statusCode = 202;
        break;
      case 'not_found':
        statusCode = 404;
        break;
      default:
        statusCode = 500;
    }
    
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error in getReportHandler:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}