# Report Processor API

A serverless API built with Clean Architecture principles for processing CSV sales reports asynchronously using AWS Lambda, S3, and API Gateway.

## 🏗️ Architecture

This project follows Clean Architecture principles with clear separation of concerns:

```
src/
├── domain/          # Business logic and entities
│   ├── entities/    # Core business entities
│   ├── repositories/# Repository interfaces
│   └── services/    # Domain service interfaces
├── application/     # Use cases and application logic
│   └── usecases/    # Application use cases
├── infrastructure/  # External concerns (AWS, databases, etc.)
│   ├── repositories/# Repository implementations
│   └── services/    # Service implementations
├── handlers/        # Lambda function handlers
└── config/          # Dependency injection and configuration
```

## 🚀 Features

- **Upload CSV files** via pre-signed S3 URLs
- **Asynchronous processing** triggered by S3 events
- **Data filtering** (products with quantity > 10)
- **Automatic calculations** (total_price = quantity × price)
- **JSON report generation** with metadata and summary
- **Download processed reports** via pre-signed URLs

## 📋 API Endpoints

### POST /reports
Creates a new report and returns an upload URL.

**Request:**
```json
{
  "fileName": "sales-data.csv"
}
```

**Response:**
```json
{
  "reportId": "uuid-here",
  "uploadUrl": "https://s3-presigned-url..."
}
```

### GET /reports/{reportId}
Checks report status and provides download URL if ready.

**Responses:**
- `200`: Report ready with download URL
- `202`: Report still processing
- `404`: Report not found

```json
{
  "status": "ready",
  "downloadUrl": "https://s3-presigned-url..."
}
```

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 18+
- AWS CLI configured
- Serverless Framework

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Build the project:**
```bash
npm run build
```

3. **Deploy to AWS:**
```bash
npm run deploy:dev
```

## 🧪 Testing

Run tests with coverage:
```bash
npm run test:coverage
```

Watch mode for development:
```bash
npm run test:watch
```

## 📊 CSV Format

Expected CSV format:
```csv
product_id,product_name,quantity,price
101,Laptop Pro,5,1200.00
102,Mouse Gamer,25,75.00
103,Teclado Mecánico,15,110.25
```

## 📄 Output Format

Processed JSON report:
```json
{
  "metadata": {
    "reportId": "uuid-here",
    "processedAt": "2025-01-16T14:30:00Z"
  },
  "items": [
    {
      "product_id": "102",
      "product_name": "Mouse Gamer",
      "quantity": 25,
      "price": 75.00,
      "total_price": 1875.00
    }
  ],
  "summary": {
    "totalItems": 1,
    "grandTotal": 1875.00
  }
}
```

## 🔧 Environment Variables

The following environment variables are automatically set by Serverless Framework:
- `UPLOADS_BUCKET`: S3 bucket for CSV uploads
- `RESULTS_BUCKET`: S3 bucket for processed results
- `AWS_REGION`: AWS region

## 📚 Development

### Project Structure
- **Domain Layer**: Pure business logic, no external dependencies
- **Application Layer**: Use cases that orchestrate domain logic
- **Infrastructure Layer**: AWS integrations and external services
- **Handlers**: Lambda function entry points

### Adding New Features
1. Define entities and business logic in `domain/`
2. Create use cases in `application/`
3. Implement infrastructure adapters in `infrastructure/`
4. Create Lambda handlers in `handlers/`
5. Configure dependency injection in `config/`

## 🚀 Deployment

### Development
```bash
npm run deploy:dev
```

### Production
```bash
npm run deploy:prod
```

### Remove Stack
```bash
npm run remove
```

## 📝 License

MIT License 