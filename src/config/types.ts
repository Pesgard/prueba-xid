export const TYPES = {
  // Repositories
  IFileRepository: Symbol.for('IFileRepository'),
  
  // Services
  ICsvProcessor: Symbol.for('ICsvProcessor'),
  
  // Use Cases
  CreateReportUseCase: Symbol.for('CreateReportUseCase'),
  ProcessCsvUseCase: Symbol.for('ProcessCsvUseCase'),
  GetReportUseCase: Symbol.for('GetReportUseCase')
}; 