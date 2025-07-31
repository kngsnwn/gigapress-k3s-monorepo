# AI 차량 관리 서비스 - 예상 산출물 구조

## 개요
Backend Service가 `test-ai-vehicle-management.json`의 데이터를 처리하여 생성해야 하는 실제 산출물 구조입니다.

## 1. 프로젝트 복사 및 기본 구조 생성

### 1.1 소스 프로젝트 복사
```
source/ebmp-proj-standard-api → output/ai-vehicle-management
```

### 1.2 패키지 구조 변경
```
기존: etners.*
변경: com.gigapress.aivehicle.*
```

## 2. 생성될 엔티티 클래스들

### 2.1 Vehicle.java
```java
package com.gigapress.aivehicle.vehicle;

import com.gigapress.aivehicle.common.base.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vehicles")
public class Vehicle extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Size(min = 5, max = 20)
    @Column(name = "vehicle_number", unique = true, nullable = false)
    private String vehicleNumber;
    
    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "make", nullable = false)
    private String make;
    
    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "model", nullable = false)
    private String model;
    
    @NotNull
    @Min(1900)
    @Max(2030)
    @Column(name = "year", nullable = false)
    private Integer year;
    
    @NotNull
    @Min(0)
    @Column(name = "mileage", nullable = false)
    private Long mileage;
    
    @NotNull
    @Column(name = "driver_id", nullable = false)
    private Long driverId;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VehicleStatus status;
    
    @NotNull
    @Column(name = "registration_date", nullable = false)
    private LocalDateTime registrationDate;
    
    public enum VehicleStatus {
        ACTIVE, INACTIVE, MAINTENANCE
    }
}
```

### 2.2 Driver.java
```java
package com.gigapress.aivehicle.driver;

import com.gigapress.aivehicle.common.base.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "drivers")
public class Driver extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Size(min = 10, max = 20)
    @Column(name = "license_number", unique = true, nullable = false)
    private String licenseNumber;
    
    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    @NotNull
    @Email
    @Column(name = "email", unique = true, nullable = false)
    private String email;
    
    @NotNull
    @Pattern(regexp = "^[0-9-]+$")
    @Column(name = "phone", nullable = false)
    private String phone;
    
    @NotNull
    @Past
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;
    
    @NotNull
    @Min(0)
    @Column(name = "experience_years", nullable = false)
    private Integer experienceYears;
    
    @NotNull
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}
```

### 2.3 MaintenanceRecord.java
```java
package com.gigapress.aivehicle.maintenance;

import com.gigapress.aivehicle.common.base.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "maintenance_records")
public class MaintenanceRecord extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_type", nullable = false)
    private MaintenanceType maintenanceType;
    
    @NotNull
    @Size(min = 10, max = 500)
    @Column(name = "description", nullable = false)
    private String description;
    
    @NotNull
    @DecimalMin("0.0")
    @Column(name = "cost", nullable = false)
    private BigDecimal cost;
    
    @NotNull
    @Column(name = "maintenance_date", nullable = false)
    private LocalDateTime maintenanceDate;
    
    @Future
    @Column(name = "next_maintenance_date")
    private LocalDateTime nextMaintenanceDate;
    
    @NotNull
    @Size(min = 2, max = 100)
    @Column(name = "mechanic_name", nullable = false)
    private String mechanicName;
    
    @Size(max = 1000)
    @Column(name = "parts_replaced")
    private String partsReplaced;
    
    public enum MaintenanceType {
        REGULAR, REPAIR, INSPECTION, EMERGENCY
    }
}
```

### 2.4 PredictiveAnalysis.java
```java
package com.gigapress.aivehicle.ai;

import com.gigapress.aivehicle.common.base.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "predictive_analyses")
public class PredictiveAnalysis extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "prediction_type", nullable = false)
    private PredictionType predictionType;
    
    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    @Column(name = "confidence_score", nullable = false)
    private BigDecimal confidenceScore;
    
    @NotNull
    @Size(min = 10, max = 5000)
    @Column(name = "prediction_data", nullable = false, columnDefinition = "TEXT")
    private String predictionData;
    
    @Column(name = "prediction_date", nullable = false)
    private LocalDateTime predictionDate;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    public enum PredictionType {
        MAINTENANCE, FAILURE, PERFORMANCE
    }
}
```

## 3. Repository 클래스들

### 3.1 VehicleRepository.java
```java
package com.gigapress.aivehicle.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);
    
    List<Vehicle> findByDriverId(Long driverId);
    
    List<Vehicle> findByStatus(Vehicle.VehicleStatus status);
    
    @Query("SELECT v FROM Vehicle v WHERE v.mileage > :mileage")
    List<Vehicle> findByMileageGreaterThan(@Param("mileage") Long mileage);
    
    boolean existsByVehicleNumber(String vehicleNumber);
}
```

## 4. Service 클래스들

### 4.1 VehicleService.java (Interface)
```java
package com.gigapress.aivehicle.vehicle;

import java.util.List;
import java.util.Optional;

public interface VehicleService {
    
    Vehicle createVehicle(Vehicle vehicle);
    
    Optional<Vehicle> getVehicleById(Long id);
    
    Optional<Vehicle> getVehicleByNumber(String vehicleNumber);
    
    List<Vehicle> getAllVehicles();
    
    List<Vehicle> getVehiclesByDriver(Long driverId);
    
    List<Vehicle> getVehiclesByStatus(Vehicle.VehicleStatus status);
    
    Vehicle updateVehicle(Long id, Vehicle vehicle);
    
    void deleteVehicle(Long id);
    
    Vehicle updateMileage(Long id, Long newMileage);
    
    Vehicle changeStatus(Long id, Vehicle.VehicleStatus newStatus);
}
```

### 4.2 VehicleServiceImpl.java (Implementation)
```java
package com.gigapress.aivehicle.vehicle;

import com.gigapress.aivehicle.exception.VehicleNotFoundException;
import com.gigapress.aivehicle.exception.VehicleNumberAlreadyExistsException;
import com.gigapress.aivehicle.exception.InvalidMileageException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class VehicleServiceImpl implements VehicleService {
    
    private final VehicleRepository vehicleRepository;
    
    @Override
    public Vehicle createVehicle(Vehicle vehicle) {
        log.info("Creating new vehicle with number: {}", vehicle.getVehicleNumber());
        
        // Business Rule: 차량번호 중복 검사
        if (vehicleRepository.existsByVehicleNumber(vehicle.getVehicleNumber())) {
            throw new VehicleNumberAlreadyExistsException(
                "Vehicle number already exists: " + vehicle.getVehicleNumber()
            );
        }
        
        vehicle.setRegistrationDate(LocalDateTime.now());
        return vehicleRepository.save(vehicle);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Vehicle> getVehicleByNumber(String vehicleNumber) {
        return vehicleRepository.findByVehicleNumber(vehicleNumber);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> getVehiclesByDriver(Long driverId) {
        return vehicleRepository.findByDriverId(driverId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> getVehiclesByStatus(Vehicle.VehicleStatus status) {
        return vehicleRepository.findByStatus(status);
    }
    
    @Override
    public Vehicle updateVehicle(Long id, Vehicle vehicle) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + id));
        
        // Business Rule: 차량번호 변경시 중복 검사
        if (!existingVehicle.getVehicleNumber().equals(vehicle.getVehicleNumber()) &&
            vehicleRepository.existsByVehicleNumber(vehicle.getVehicleNumber())) {
            throw new VehicleNumberAlreadyExistsException(
                "Vehicle number already exists: " + vehicle.getVehicleNumber()
            );
        }
        
        // Business Rule: 주행거리 감소 불가
        if (vehicle.getMileage() < existingVehicle.getMileage()) {
            throw new InvalidMileageException(
                "New mileage cannot be less than current mileage"
            );
        }
        
        existingVehicle.setVehicleNumber(vehicle.getVehicleNumber());
        existingVehicle.setMake(vehicle.getMake());
        existingVehicle.setModel(vehicle.getModel());
        existingVehicle.setYear(vehicle.getYear());
        existingVehicle.setMileage(vehicle.getMileage());
        existingVehicle.setDriverId(vehicle.getDriverId());
        existingVehicle.setStatus(vehicle.getStatus());
        
        return vehicleRepository.save(existingVehicle);
    }
    
    @Override
    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new VehicleNotFoundException("Vehicle not found with id: " + id);
        }
        vehicleRepository.deleteById(id);
    }
    
    @Override
    public Vehicle updateMileage(Long id, Long newMileage) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + id));
        
        // Business Rule: 주행거리 감소 불가
        if (newMileage < vehicle.getMileage()) {
            throw new InvalidMileageException(
                "New mileage cannot be less than current mileage"
            );
        }
        
        vehicle.setMileage(newMileage);
        return vehicleRepository.save(vehicle);
    }
    
    @Override
    public Vehicle changeStatus(Long id, Vehicle.VehicleStatus newStatus) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + id));
        
        vehicle.setStatus(newStatus);
        return vehicleRepository.save(vehicle);
    }
}
```

## 5. Controller 클래스들

### 5.1 VehicleController.java
```java
package com.gigapress.aivehicle.vehicle;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicle Management", description = "차량 관리 API")
public class VehicleController {
    
    private final VehicleService vehicleService;
    private final VehicleMapper vehicleMapper;
    
    @PostMapping
    @Operation(summary = "차량 등록", description = "새로운 차량을 등록합니다")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<VehicleDto.Response> createVehicle(
            @Valid @RequestBody VehicleDto.CreateRequest request) {
        
        log.info("Creating vehicle: {}", request.getVehicleNumber());
        
        Vehicle vehicle = vehicleMapper.toEntity(request);
        Vehicle createdVehicle = vehicleService.createVehicle(vehicle);
        VehicleDto.Response response = vehicleMapper.toResponse(createdVehicle);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "차량 조회", description = "ID로 차량 정보를 조회합니다")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<VehicleDto.Response> getVehicle(@PathVariable Long id) {
        
        return vehicleService.getVehicleById(id)
                .map(vehicle -> ResponseEntity.ok(vehicleMapper.toResponse(vehicle)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    @Operation(summary = "차량 목록 조회", description = "모든 차량 목록을 조회합니다")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<List<VehicleDto.Response>> getAllVehicles() {
        
        List<Vehicle> vehicles = vehicleService.getAllVehicles();
        List<VehicleDto.Response> responses = vehicles.stream()
                .map(vehicleMapper::toResponse)
                .toList();
        
        return ResponseEntity.ok(responses);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "차량 정보 수정", description = "차량 정보를 수정합니다")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<VehicleDto.Response> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleDto.UpdateRequest request) {
        
        Vehicle vehicle = vehicleMapper.toEntity(request);
        Vehicle updatedVehicle = vehicleService.updateVehicle(id, vehicle);
        VehicleDto.Response response = vehicleMapper.toResponse(updatedVehicle);
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "차량 삭제", description = "차량을 삭제합니다")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/mileage")
    @Operation(summary = "주행거리 업데이트", description = "차량의 주행거리를 업데이트합니다")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<VehicleDto.Response> updateMileage(
            @PathVariable Long id,
            @Valid @RequestBody VehicleDto.MileageUpdateRequest request) {
        
        Vehicle updatedVehicle = vehicleService.updateMileage(id, request.getMileage());
        VehicleDto.Response response = vehicleMapper.toResponse(updatedVehicle);
        
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "차량 상태 변경", description = "차량의 상태를 변경합니다")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<VehicleDto.Response> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody VehicleDto.StatusUpdateRequest request) {
        
        Vehicle updatedVehicle = vehicleService.changeStatus(id, request.getStatus());
        VehicleDto.Response response = vehicleMapper.toResponse(updatedVehicle);
        
        return ResponseEntity.ok(response);
    }
}
```

## 6. Exception 클래스들

### 6.1 VehicleNotFoundException.java
```java
package com.gigapress.aivehicle.exception;

public class VehicleNotFoundException extends RuntimeException {
    public VehicleNotFoundException(String message) {
        super(message);
    }
}
```

### 6.2 VehicleNumberAlreadyExistsException.java
```java
package com.gigapress.aivehicle.exception;

public class VehicleNumberAlreadyExistsException extends RuntimeException {
    public VehicleNumberAlreadyExistsException(String message) {
        super(message);
    }
}
```

### 6.3 InvalidMileageException.java
```java
package com.gigapress.aivehicle.exception;

public class InvalidMileageException extends RuntimeException {
    public InvalidMileageException(String message) {
        super(message);
    }
}
```

## 7. 데이터베이스 마이그레이션

### 7.1 V001__Create_vehicle_tables.sql
```sql
-- 차량 테이블
CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2030),
    mileage BIGINT NOT NULL CHECK (mileage >= 0),
    driver_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    registration_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 운전자 테이블
CREATE TABLE drivers (
    id BIGSERIAL PRIMARY KEY,
    license_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 정비 기록 테이블
CREATE TABLE maintenance_records (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    maintenance_type VARCHAR(20) NOT NULL CHECK (maintenance_type IN ('REGULAR', 'REPAIR', 'INSPECTION', 'EMERGENCY')),
    description TEXT NOT NULL,
    cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
    maintenance_date TIMESTAMP NOT NULL,
    next_maintenance_date TIMESTAMP,
    mechanic_name VARCHAR(100) NOT NULL,
    parts_replaced TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- AI 예측 분석 테이블
CREATE TABLE predictive_analyses (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    prediction_type VARCHAR(20) NOT NULL CHECK (prediction_type IN ('MAINTENANCE', 'FAILURE', 'PERFORMANCE')),
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    prediction_data TEXT NOT NULL,
    prediction_date TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- 인덱스 생성
CREATE INDEX idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_maintenance_vehicle_id ON maintenance_records(vehicle_id);
CREATE INDEX idx_maintenance_date ON maintenance_records(maintenance_date);
CREATE INDEX idx_predictive_vehicle_id ON predictive_analyses(vehicle_id);
CREATE INDEX idx_predictive_type ON predictive_analyses(prediction_type);
```

## 8. 최종 프로젝트 구조

```
output/ai-vehicle-management/
├── src/main/java/com/gigapress/aivehicle/
│   ├── AiVehicleManagementApplication.java (메인 클래스)
│   ├── common/
│   │   ├── base/BaseEntity.java
│   │   └── config/ (설정 클래스들)
│   ├── vehicle/
│   │   ├── Vehicle.java
│   │   ├── VehicleRepository.java
│   │   ├── VehicleService.java
│   │   ├── VehicleServiceImpl.java
│   │   ├── VehicleController.java
│   │   ├── VehicleDto.java
│   │   └── VehicleMapper.java
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
│   └── exception/
│       ├── VehicleNotFoundException.java
│       ├── VehicleNumberAlreadyExistsException.java
│       ├── InvalidMileageException.java
│       └── ... (기타 예외 클래스들)
├── src/main/resources/
│   ├── application.properties
│   ├── db/migration/
│   │   └── V001__Create_vehicle_tables.sql
│   └── static/ & templates/ (필요시)
└── src/test/java/com/gigapress/aivehicle/
    ├── vehicle/VehicleServiceTest.java
    ├── driver/DriverServiceTest.java
    ├── maintenance/MaintenanceRecordServiceTest.java
    └── ai/PredictiveAnalysisServiceTest.java
```

이 구조가 Backend Service가 `test-ai-vehicle-management.json`의 데이터를 기반으로 생성해야 하는 완전한 AI 차량 관리 서비스 프로젝트입니다.