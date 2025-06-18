import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Domain interfaces
import { IFileRepository } from '../domain/interfaces/IFileRepository';
import { ICsvProcessor } from '../domain/interfaces/ICsvProcessor';

// Infrastructure implementations
import { AwsS3FileRepository } from '../infrastructure/repositories/AwsS3FileRepository';
import { NodeCsvProcessor } from '../infrastructure/services/NodeCsvProcessor';

// Application use cases
import { CreateReportUseCase } from '../application/usecases/CreateReportUseCase';
import { ProcessCsvUseCase } from '../application/usecases/ProcessCsvUseCase';
import { GetReportUseCase } from '../application/usecases/GetReportUseCase';

const container = new Container();

// Bind repositories
container.bind<IFileRepository>(TYPES.IFileRepository).to(AwsS3FileRepository);

// Bind services
container.bind<ICsvProcessor>(TYPES.ICsvProcessor).to(NodeCsvProcessor);

// Bind use cases
container.bind<CreateReportUseCase>(TYPES.CreateReportUseCase).to(CreateReportUseCase);
container.bind<ProcessCsvUseCase>(TYPES.ProcessCsvUseCase).to(ProcessCsvUseCase);
container.bind<GetReportUseCase>(TYPES.GetReportUseCase).to(GetReportUseCase);

export { container }; 