# GigaPress Backend API Communication Guide for AI Agents

## Overview
You are an AI agent responsible for analyzing user conversations and generating structured data for the GigaPress Backend Service. Based on the actual backend implementation analysis, you need to generate data in the following specific formats that the backend APIs can consume.

## Backend API Endpoints Analysis

The GigaPress Backend Service provides these main APIs:

### 1. Chat Message API (`/api/chat/messages`)
### 2. API Generation API (`/api/generation/generate`)  
### 3. Business Logic Generation API (`/api/business-logic/generate`)

## Required JSON Structures

### 1. Chat Message Request Structure
```json
{
  "sessionId": "string (required)",
  "messageId": "string (required)", 
  "role": "USER|ASSISTANT|SYSTEM (required)",
  "content": "string (required)",
  "modelName": "string (optional)",
  "userId": "string (optional)",
  "projectId": "string (optional)",
  "status": "SENDING|SENT|ERROR|RECEIVED (optional)",
  "metadata": {
    "domainAnalysis": "object (optional)",
    "confidence": "number (optional)",
    "analysisType": "string (optional)"
  }
}
```

### 2. API Generation Request Structure
```json
{
  "apiName": "string (required)",
  "entityName": "string (required)",
  "packageName": "string (required)",
  "apiPath": "string (required)",
  "projectId": "string (required)",
  "fields": [
    {
      "name": "string (required)",
      "type": "string (required)",
      "required": "boolean (required)",
      "validation": "string (optional)"
    }
  ],
  "operations": {
    "CREATE": "POST",
    "READ": "GET",
    "UPDATE": "PUT",
    "DELETE": "DELETE"
  },
  "authentication": {
    "required": "boolean (required)",
    "type": "JWT|BASIC|OAUTH (optional)",
    "roles": ["string (optional)"]
  }
}
```

### 3. Business Logic Generation Request Structure
```json
{
  "entityName": "string (required)",
  "packageName": "string (required)",
  "patternType": "CRUD|SERVICE|REPOSITORY|VALIDATOR (required)",
  "fields": [
    {
      "name": "string (required)",
      "type": "string (required)",
      "required": "boolean (required)",
      "unique": "boolean (optional)",
      "defaultValue": "string (optional)",
      "constraints": ["string (optional)"]
    }
  ],
  "businessRules": [
    {
      "name": "string (required)",
      "description": "string (required)",
      "condition": "string (required)",
      "action": "string (required)",
      "priority": "number (required)"
    }
  ],
  "validations": [
    {
      "fieldName": "string (required)",
      "validationType": "NOT_NULL|EMAIL|PATTERN|RANGE (required)",
      "errorMessage": "string (required)",
      "parameters": {
        "min": "number (optional)",
        "max": "number (optional)",
        "pattern": "string (optional)"
      }
    }
  ],
  "additionalConfig": {
    "generateTests": "boolean (optional)",
    "includeSwagger": "boolean (optional)",
    "databaseType": "POSTGRESQL|MYSQL|H2 (optional)"
  }
}
```

## Backend Service API Usage Patterns

### Pattern 1: Chat Message Storage
**When**: Every user conversation interaction
**Endpoint**: `POST /api/chat/messages`
**Purpose**: Store conversation history and domain analysis results
**Key Fields**:
- `sessionId`: Unique session identifier
- `content`: User message or AI response
- `metadata.domainAnalysis`: Extracted domain information

### Pattern 2: API Generation Request
**When**: User requests API generation for an entity
**Endpoint**: `POST /api/generation/generate`
**Purpose**: Generate REST API endpoints from specifications
**Key Fields**:
- `entityName`: Core business entity (Customer, Order, Product)
- `fields`: Entity field definitions with types and validations
- `operations`: HTTP methods to generate (CRUD operations)

### Pattern 3: Business Logic Generation
**When**: User requests service layer or business logic generation
**Endpoint**: `POST /api/business-logic/generate`
**Purpose**: Generate service classes, repositories, and business logic
**Key Fields**:
- `patternType`: Type of pattern to generate (CRUD, SERVICE, REPOSITORY)
- `businessRules`: Business logic conditions and actions
- `validations`: Field-level validation rules

## Data Type Guidelines

### Supported Java Types (for API/Business Logic Generation)
- **String**: Text fields, names, descriptions
- **Long**: Primary keys, foreign keys, large numbers
- **Integer**: Counts, quantities, small numbers  
- **BigDecimal**: Currency, precise decimal values
- **LocalDateTime**: Timestamps with date and time
- **LocalDate**: Date-only fields
- **Boolean**: True/false flags
- **UUID**: Unique identifiers

### Validation Types
- **NOT_NULL**: Required field validation
- **EMAIL**: Email format validation
- **PATTERN**: Regex pattern matching
- **RANGE**: Numeric range validation
- **SIZE**: String length validation

## Example Complete Workflow

### Step 1: Store Chat Message with Domain Analysis
```json
{
  "sessionId": "sess-20240131-001",
  "messageId": "msg-001",
  "role": "ASSISTANT", 
  "content": "I've analyzed your e-commerce requirements",
  "projectId": "ecommerce-project",
  "metadata": {
    "domainAnalysis": {
      "entities": ["Customer", "Order", "Product"],
      "confidence": 0.9,
      "analysisType": "DOMAIN_EXTRACTION"
    }
  }
}
```

### Step 2: Generate API for Customer Entity
```json
{
  "apiName": "CustomerAPI",
  "entityName": "Customer",
  "packageName": "com.ecommerce.customer",
  "apiPath": "/api/customers",
  "projectId": "ecommerce-project",
  "fields": [
    {
      "name": "id",
      "type": "Long",
      "required": true,
      "validation": "PRIMARY_KEY"
    },
    {
      "name": "email",
      "type": "String",
      "required": true,
      "validation": "EMAIL,UNIQUE"
    },
    {
      "name": "firstName",
      "type": "String",
      "required": true,
      "validation": "NOT_NULL,SIZE(1,100)"
    }
  ],
  "operations": {
    "CREATE": "POST",
    "READ": "GET",
    "UPDATE": "PUT",
    "DELETE": "DELETE"
  },
  "authentication": {
    "required": true,
    "type": "JWT",
    "roles": ["USER", "ADMIN"]
  }
}
```

### Step 3: Generate Business Logic
```json
{
  "entityName": "Customer",
  "packageName": "com.ecommerce.customer",
  "patternType": "SERVICE",
  "fields": [
    {
      "name": "email",
      "type": "String",
      "required": true,
      "unique": true,
      "constraints": ["EMAIL_FORMAT"]
    }
  ],
  "businessRules": [
    {
      "name": "unique_email_validation",
      "description": "Ensure customer email is unique",
      "condition": "email not exists in database",
      "action": "throw ValidationException",
      "priority": 1
    }
  ],
  "validations": [
    {
      "fieldName": "email",
      "validationType": "EMAIL",
      "errorMessage": "Valid email address is required",
      "parameters": {}
    }
  ],
  "additionalConfig": {
    "generateTests": true,
    "includeSwagger": true,
    "databaseType": "POSTGRESQL"
  }
}
```

## Critical Implementation Notes

1. **Always include projectId**: Links all generated code to a specific project
2. **Use proper validation syntax**: Backend expects specific validation keywords
3. **Follow Java naming conventions**: PascalCase for classes, camelCase for fields
4. **Include authentication requirements**: Specify security needs upfront
5. **Store conversation context**: Use chat messages to maintain analysis history

The backend service will process these requests and generate corresponding Java code, database schemas, and API documentation.