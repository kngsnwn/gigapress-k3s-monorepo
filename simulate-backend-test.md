# AI 차량 관리 서비스 Backend Service 테스트 시뮬레이션

## 테스트 시나리오 실행 결과

### Step 1: Chat Message - 사용자 요구사항 저장
**Request:**
```bash
curl -X POST http://localhost:8084/api/chat/messages \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "ai-vehicle-session-2024-01-31",
    "messageId": "msg-vehicle-001",
    "role": "USER",
    "content": "AI 기반 차량 관리 시스템을 만들고 싶습니다. 차량 정보, 운전자 정보, 정비 이력, AI 예측 분석 기능이 필요합니다.",
    "userId": "user-001",
    "projectId": "ai-vehicle-management",
    "status": "SENT",
    "metadata": {
      "analysisType": "INITIAL_REQUIREMENTS",
      "confidence": 0.9
    }
  }'
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "sessionId": "ai-vehicle-session-2024-01-31",
  "messageId": "msg-vehicle-001",
  "role": "USER",
  "content": "AI 기반 차량 관리 시스템을 만들고 싶습니다. 차량 정보, 운전자 정보, 정비 이력, AI 예측 분석 기능이 필요합니다.",
  "userId": "user-001",
  "projectId": "ai-vehicle-management",
  "status": "SENT",
  "sequenceNumber": 1,
  "createdAt": "2024-01-31T10:30:00Z",
  "metadata": {
    "analysisType": "INITIAL_REQUIREMENTS",
    "confidence": 0.9
  }
}
```

### Step 2: Chat Message - AI 분석 결과 저장
**Request:**
```bash
curl -X POST http://localhost:8084/api/chat/messages \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "ai-vehicle-session-2024-01-31",
    "messageId": "msg-vehicle-002",
    "role": "ASSISTANT",
    "content": "AI 차량 관리 시스템을 위해 다음 엔티티들을 식별했습니다: Vehicle(차량), Driver(운전자), MaintenanceRecord(정비기록), PredictiveAnalysis(예측분석)",
    "projectId": "ai-vehicle-management",
    "metadata": {
      "domainAnalysis": {
        "entities": ["Vehicle", "Driver", "MaintenanceRecord", "PredictiveAnalysis"],
        "relationships": [
          {"from": "Driver", "to": "Vehicle", "type": "ONE_TO_MANY"},
          {"from": "Vehicle", "to": "MaintenanceRecord", "type": "ONE_TO_MANY"},
          {"from": "Vehicle", "to": "PredictiveAnalysis", "type": "ONE_TO_MANY"}
        ],
        "confidence": 0.95,
        "analysisType": "DOMAIN_EXTRACTION"
      }
    }
  }'
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "sessionId": "ai-vehicle-session-2024-01-31",
  "messageId": "msg-vehicle-002",
  "role": "ASSISTANT",
  "content": "AI 차량 관리 시스템을 위해 다음 엔티티들을 식별했습니다: Vehicle(차량), Driver(운전자), MaintenanceRecord(정비기록), PredictiveAnalysis(예측분석)",
  "projectId": "ai-vehicle-management",
  "status": "SENT",
  "sequenceNumber": 2,
  "createdAt": "2024-01-31T10:31:00Z",
  "metadata": {
    "domainAnalysis": {
      "entities": ["Vehicle", "Driver", "MaintenanceRecord", "PredictiveAnalysis"],
      "relationships": [
        {"from": "Driver", "to": "Vehicle", "type": "ONE_TO_MANY"},
        {"from": "Vehicle", "to": "MaintenanceRecord", "type": "ONE_TO_MANY"},
        {"from": "Vehicle", "to": "PredictiveAnalysis", "type": "ONE_TO_MANY"}
      ],
      "confidence": 0.95,
      "analysisType": "DOMAIN_EXTRACTION"
    }
  }
}
```

### Step 3: API Generation - Vehicle Entity API 생성
**Request:**
```bash
curl -X POST http://localhost:8084/api/generation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "apiName": "VehicleAPI",
    "entityName": "Vehicle",
    "packageName": "com.gigapress.aivehicle.vehicle",
    "apiPath": "/api/vehicles",
    "projectId": "ai-vehicle-management",
    "fields": [
      {
        "name": "id",
        "type": "Long",
        "required": true,
        "validation": "PRIMARY_KEY"
      },
      {
        "name": "vehicleNumber",
        "type": "String",
        "required": true,
        "validation": "NOT_NULL,UNIQUE,SIZE(5,20)"
      },
      {
        "name": "make",
        "type": "String",
        "required": true,
        "validation": "NOT_NULL,SIZE(1,50)"
      },
      {
        "name": "model",
        "type": "String",
        "required": true,
        "validation": "NOT_NULL,SIZE(1,50)"
      },
      {
        "name": "year",
        "type": "Integer",
        "required": true,
        "validation": "NOT_NULL,RANGE(1900,2030)"
      },
      {
        "name": "mileage",
        "type": "Long",
        "required": true,
        "validation": "NOT_NULL,MIN(0)"
      },
      {
        "name": "driverId",
        "type": "Long",
        "required": true,
        "validation": "NOT_NULL,FOREIGN_KEY"
      },
      {
        "name": "status",
        "type": "String",
        "required": true,
        "validation": "NOT_NULL,ENUM(ACTIVE,INACTIVE,MAINTENANCE)"
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
      "roles": ["ADMIN", "MANAGER", "USER"]
    }
  }'
```

**Expected Response:**
```json
{
  "apiName": "VehicleAPI",
  "entityName": "Vehicle",
  "packageName": "com.gigapress.aivehicle.vehicle",
  "generatedFiles": [
    {
      "fileName": "Vehicle.java",
      "fileType": "ENTITY",
      "filePath": "src/main/java/com/gigapress/aivehicle/vehicle/Vehicle.java",
      "content": "package com.gigapress.aivehicle.vehicle;\n\nimport jakarta.persistence.*;\nimport lombok.Data;\n\n@Data\n@Entity\n@Table(name = \"vehicles\")\npublic class Vehicle {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    \n    @Column(unique = true, nullable = false, length = 20)\n    private String vehicleNumber;\n    \n    // ... other fields\n}"
    },
    {
      "fileName": "VehicleController.java",
      "fileType": "CONTROLLER",
      "filePath": "src/main/java/com/gigapress/aivehicle/vehicle/VehicleController.java",
      "content": "package com.gigapress.aivehicle.vehicle;\n\nimport org.springframework.web.bind.annotation.*;\n\n@RestController\n@RequestMapping(\"/api/vehicles\")\npublic class VehicleController {\n    // Generated CRUD endpoints\n}"
    },
    {
      "fileName": "VehicleRepository.java",
      "fileType": "REPOSITORY",
      "filePath": "src/main/java/com/gigapress/aivehicle/vehicle/VehicleRepository.java",
      "content": "package com.gigapress.aivehicle.vehicle;\n\nimport org.springframework.data.jpa.repository.JpaRepository;\n\npublic interface VehicleRepository extends JpaRepository<Vehicle, Long> {\n    // Generated query methods\n}"
    },
    {
      "fileName": "VehicleService.java",
      "fileType": "SERVICE",
      "filePath": "src/main/java/com/gigapress/aivehicle/vehicle/VehicleService.java",
      "content": "package com.gigapress.aivehicle.vehicle;\n\nimport org.springframework.stereotype.Service;\n\n@Service\npublic class VehicleService {\n    // Generated business logic\n}"
    }
  ],
  "generatedEndpoints": [
    "POST /api/vehicles",
    "GET /api/vehicles",
    "GET /api/vehicles/{id}",
    "PUT /api/vehicles/{id}",
    "DELETE /api/vehicles/{id}"
  ],
  "status": "SUCCESS",
  "generatedAt": "2024-01-31T10:32:00Z"
}
```

### Step 4: Business Logic Generation - Vehicle Service 생성
**Request:**
```bash
curl -X POST http://localhost:8084/api/business-logic/generate \
  -H "Content-Type: application/json" \
  -d '{
    "entityName": "Vehicle",
    "packageName": "com.gigapress.aivehicle.vehicle",
    "patternType": "SERVICE",
    "fields": [
      {
        "name": "vehicleNumber",
        "type": "String",
        "required": true,
        "unique": true,
        "constraints": ["UNIQUE_VALIDATION", "FORMAT_CHECK"]
      },
      {
        "name": "mileage",
        "type": "Long",
        "required": true,
        "unique": false,
        "constraints": ["POSITIVE_VALUE", "MILEAGE_INCREMENT_CHECK"]
      }
    ],
    "businessRules": [
      {
        "name": "unique_vehicle_number",
        "description": "차량번호는 시스템 전체에서 유일해야 함",
        "condition": "vehicleNumber not exists in database",
        "action": "throw VehicleNumberAlreadyExistsException",
        "priority": 1
      },
      {
        "name": "mileage_increment_only",
        "description": "주행거리는 감소할 수 없음",
        "condition": "new mileage >= current mileage",
        "action": "throw InvalidMileageException",
        "priority": 2
      }
    ],
    "validations": [
      {
        "fieldName": "vehicleNumber",
        "validationType": "PATTERN",
        "errorMessage": "차량번호 형식이 올바르지 않습니다",
        "parameters": {
          "pattern": "^[0-9]{2}[가-힣][0-9]{4}$"
        }
      }
    ],
    "additionalConfig": {
      "generateTests": true,
      "includeSwagger": true,
      "databaseType": "POSTGRESQL"
    }
  }'
```

**Expected Response:**
```json
{
  "entityName": "Vehicle",
  "patternType": "SERVICE",
  "generatedFiles": [
    {
      "fileName": "VehicleServiceImpl.java",
      "fileType": "SERVICE_IMPL",
      "filePath": "src/main/java/com/gigapress/aivehicle/vehicle/VehicleServiceImpl.java",
      "content": "@Service\n@Transactional\npublic class VehicleServiceImpl implements VehicleService {\n    \n    private final VehicleRepository vehicleRepository;\n    \n    @Override\n    public Vehicle createVehicle(Vehicle vehicle) {\n        // Business Rule: unique_vehicle_number\n        if (vehicleRepository.existsByVehicleNumber(vehicle.getVehicleNumber())) {\n            throw new VehicleNumberAlreadyExistsException(\n                \"Vehicle number already exists: \" + vehicle.getVehicleNumber()\n            );\n        }\n        \n        return vehicleRepository.save(vehicle);\n    }\n    \n    @Override\n    public Vehicle updateMileage(Long vehicleId, Long newMileage) {\n        Vehicle vehicle = vehicleRepository.findById(vehicleId)\n            .orElseThrow(() -> new VehicleNotFoundException(\"Vehicle not found\"));\n        \n        // Business Rule: mileage_increment_only\n        if (newMileage < vehicle.getMileage()) {\n            throw new InvalidMileageException(\n                \"New mileage cannot be less than current mileage\"\n            );\n        }\n        \n        vehicle.setMileage(newMileage);\n        return vehicleRepository.save(vehicle);\n    }\n}"
    },
    {
      "fileName": "VehicleNumberAlreadyExistsException.java",
      "fileType": "EXCEPTION",
      "filePath": "src/main/java/com/gigapress/aivehicle/exception/VehicleNumberAlreadyExistsException.java",
      "content": "package com.gigapress.aivehicle.exception;\n\npublic class VehicleNumberAlreadyExistsException extends RuntimeException {\n    public VehicleNumberAlreadyExistsException(String message) {\n        super(message);\n    }\n}"
    },
    {
      "fileName": "InvalidMileageException.java",
      "fileType": "EXCEPTION",
      "filePath": "src/main/java/com/gigapress/aivehicle/exception/InvalidMileageException.java",
      "content": "package com.gigapress.aivehicle.exception;\n\npublic class InvalidMileageException extends RuntimeException {\n    public InvalidMileageException(String message) {\n        super(message);\n    }\n}"
    },
    {
      "fileName": "VehicleServiceTest.java",
      "fileType": "TEST",
      "filePath": "src/test/java/com/gigapress/aivehicle/vehicle/VehicleServiceTest.java",
      "content": "@ExtendWith(MockitoExtension.class)\nclass VehicleServiceTest {\n    \n    @Mock\n    private VehicleRepository vehicleRepository;\n    \n    @InjectMocks\n    private VehicleServiceImpl vehicleService;\n    \n    @Test\n    void shouldThrowExceptionWhenVehicleNumberExists() {\n        // Given\n        Vehicle vehicle = Vehicle.builder()\n            .vehicleNumber(\"12가1234\")\n            .build();\n        \n        when(vehicleRepository.existsByVehicleNumber(\"12가1234\"))\n            .thenReturn(true);\n        \n        // When & Then\n        assertThrows(VehicleNumberAlreadyExistsException.class, \n            () -> vehicleService.createVehicle(vehicle));\n    }\n    \n    @Test\n    void shouldThrowExceptionWhenMileageDecreases() {\n        // Given\n        Vehicle existingVehicle = Vehicle.builder()\n            .id(1L)\n            .mileage(10000L)\n            .build();\n        \n        when(vehicleRepository.findById(1L))\n            .thenReturn(Optional.of(existingVehicle));\n        \n        // When & Then\n        assertThrows(InvalidMileageException.class, \n            () -> vehicleService.updateMileage(1L, 9000L));\n    }\n}"
    }
  ],
  "businessRulesImplemented": [
    {
      "name": "unique_vehicle_number",
      "status": "IMPLEMENTED",
      "implementation": "Validation in createVehicle method with database existence check"
    },
    {
      "name": "mileage_increment_only", 
      "status": "IMPLEMENTED",
      "implementation": "Validation in updateMileage method with comparison logic"
    }
  ],
  "validationsImplemented": [
    {
      "fieldName": "vehicleNumber",
      "validationType": "PATTERN",
      "status": "IMPLEMENTED",
      "implementation": "@Pattern annotation on entity field"
    }
  ],
  "executionPlan": {
    "steps": [
      "1. Copy ebmp-proj-standard-api to output/ai-vehicle-management",
      "2. Update package names from 'etners' to 'com.gigapress.aivehicle'",
      "3. Generate Vehicle entity with JPA annotations",
      "4. Generate VehicleRepository with custom query methods",
      "5. Generate VehicleService interface and implementation with business rules",
      "6. Generate VehicleController with REST endpoints",
      "7. Generate exception classes for business rule violations",
      "8. Generate unit tests for service layer",
      "9. Generate database migration scripts",
      "10. Update application.properties with project-specific configurations"
    ],
    "estimatedFiles": 25,
    "estimatedLinesOfCode": 2500
  },
  "status": "SUCCESS",
  "generatedAt": "2024-01-31T10:33:00Z"
}
```

## 최종 산출물 구조

위의 API 호출들이 성공하면 다음과 같은 완전한 프로젝트가 생성됩니다:

```
output/ai-vehicle-management/
├── src/main/java/com/gigapress/aivehicle/
│   ├── AiVehicleManagementApplication.java
│   ├── vehicle/
│   │   ├── Vehicle.java (엔티티)
│   │   ├── VehicleRepository.java (레포지토리)
│   │   ├── VehicleService.java (서비스 인터페이스)
│   │   ├── VehicleServiceImpl.java (서비스 구현체)
│   │   ├── VehicleController.java (REST 컨트롤러)
│   │   ├── VehicleDto.java (DTO 클래스들)
│   │   └── VehicleMapper.java (MapStruct 매퍼)
│   ├── driver/
│   │   ├── Driver.java
│   │   ├── DriverRepository.java
│   │   ├── DriverService.java
│   │   ├── DriverServiceImpl.java
│   │   ├── DriverController.java
│   │   ├── DriverDto.java
│   │   └── DriverMapper.java
│   ├── maintenance/
│   │   ├── MaintenanceRecord.java
│   │   ├── MaintenanceRecordRepository.java
│   │   ├── MaintenanceRecordService.java
│   │   ├── MaintenanceRecordServiceImpl.java
│   │   ├── MaintenanceRecordController.java
│   │   ├── MaintenanceRecordDto.java
│   │   └── MaintenanceRecordMapper.java
│   ├── ai/
│   │   ├── PredictiveAnalysis.java
│   │   ├── PredictiveAnalysisRepository.java
│   │   ├── PredictiveAnalysisService.java
│   │   ├── PredictiveAnalysisServiceImpl.java
│   │   ├── PredictiveAnalysisController.java
│   │   ├── PredictiveAnalysisDto.java
│   │   ├── PredictiveAnalysisMapper.java
│   │   └── AIModelService.java
│   ├── exception/
│   │   ├── VehicleNotFoundException.java
│   │   ├── VehicleNumberAlreadyExistsException.java
│   │   ├── InvalidMileageException.java
│   │   └── ... (기타 예외 클래스들)
│   └── config/
│       ├── SecurityConfig.java
│       ├── SwaggerConfig.java
│       └── DatabaseConfig.java
├── src/main/resources/
│   ├── application.properties
│   ├── db/migration/
│   │   └── V001__Create_vehicle_tables.sql
│   └── templates/
└── src/test/java/com/gigapress/aivehicle/
    ├── vehicle/VehicleServiceTest.java
    ├── driver/DriverServiceTest.java
    ├── maintenance/MaintenanceRecordServiceTest.java
    └── ai/PredictiveAnalysisServiceTest.java
```

## 핵심 구현된 기능들

### 1. 비즈니스 룰 구현
- **차량번호 중복 검사**: 시스템 전체에서 유일성 보장
- **주행거리 증가 전용**: 감소 방지 로직
- **상태별 차량 관리**: ACTIVE/INACTIVE/MAINTENANCE 상태 관리
- **운전자 배정 규칙**: 활성 차량은 반드시 운전자 배정

### 2. 검증 로직
- **차량번호 패턴**: 한국 차량번호 형식 검증 (12가1234)
- **연식 범위**: 1900~2030년 범위 검증
- **주행거리 양수**: 0 이상 값만 허용
- **이메일 형식**: 운전자 이메일 형식 검증

### 3. AI 예측 분석
- **신뢰도 점수**: 0.0~1.0 범위 검증
- **예측 데이터**: JSON 형식 검증
- **예측 타입**: MAINTENANCE/FAILURE/PERFORMANCE 분류
- **만료 시간**: 예측 결과 유효 기간 관리

### 4. REST API
- **완전한 CRUD**: 모든 엔티티에 대한 생성/조회/수정/삭제
- **인증/인가**: JWT 기반 역할별 접근 제어
- **API 문서**: Swagger 자동 생성
- **예외 처리**: 표준화된 에러 응답

이 시뮬레이션은 실제 Backend Service가 `test-ai-vehicle-management.json`의 데이터를 처리했을 때 생성되는 완전한 AI 차량 관리 시스템의 모습을 보여줍니다.