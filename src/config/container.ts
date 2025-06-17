import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Domain interfaces
import { FileRepository } from '../domain/repositories/FileRepository';
import { CsvProcessor } from '../domain/services/CsvProcessor';

// Infrastructure implementations
import { S3FileRepository } from '../infrastructure/repositories/S3FileRepository';
import { CsvProcessorImpl } from '../infrastructure/services/CsvProcessorImpl';

// Application use cases
import { CreateReportUseCase } from '../application/usecases/CreateReportUseCase';
import { ProcessCsvUseCase } from '../application/usecases/ProcessCsvUseCase';
import { GetReportUseCase } from '../application/usecases/GetReportUseCase';

const container = new Container();

// Bind repositories
container.bind<FileRepository>(TYPES.FileRepository).to(S3FileRepository);

// Bind services
container.bind<CsvProcessor>(TYPES.CsvProcessor).to(CsvProcessorImpl);

// Bind use cases
container.bind<CreateReportUseCase>(TYPES.CreateReportUseCase).to(CreateReportUseCase);
container.bind<ProcessCsvUseCase>(TYPES.ProcessCsvUseCase).to(ProcessCsvUseCase);
container.bind<GetReportUseCase>(TYPES.GetReportUseCase).to(GetReportUseCase);

export { container }; 