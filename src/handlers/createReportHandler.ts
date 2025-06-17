import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { container } from '../config/container';
import { CreateReportUseCase } from '../application/usecases/CreateReportUseCase';
import { TYPES } from '../config/types';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const createReportUseCase = container.get<CreateReportUseCase>(TYPES.CreateReportUseCase);
    
    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};
    const fileName = body.fileName || 'sales-data.csv';
    
    // Execute use case
    const result = await createReportUseCase.execute({ fileName });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error in createReportHandler:', error);
    
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