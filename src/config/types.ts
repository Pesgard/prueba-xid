export const TYPES = {
  // Repositories
  FileRepository: Symbol.for('FileRepository'),
  
  // Services
  CsvProcessor: Symbol.for('CsvProcessor'),
  
  // Use Cases
  CreateReportUseCase: Symbol.for('CreateReportUseCase'),
  ProcessCsvUseCase: Symbol.for('ProcessCsvUseCase'),
  GetReportUseCase: Symbol.for('GetReportUseCase')
}; 