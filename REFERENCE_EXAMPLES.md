# GigaPress Services Reference Examples

## 📋 Overview

이 문서는 GigaPress의 모든 서비스가 참조할 수 있는 표준 구조와 예제를 제공합니다. 
`source` 디렉토리의 `ebmp-lib-common-module`과 `ebmp-proj-standard-api`를 기반으로 작성되었습니다.

## 🏗️ Service Architecture Template

### 1. 기본 Service 구조

```
[service-name]/
├── src/main/java/com/gigapress/[service]/
│   ├── common/              # 공통 모듈
│   │   ├── base/
│   │   ├── config/
│   │   ├── exception/
│   │   └── util/
│   ├── domain/              # 도메인별 구조
│   │   └── [domain-name]/
│   │       ├── entity/      # JPA 엔티티
│   │       ├── repository/  # 데이터 접근
│   │       ├── service/     # 비즈니스 로직
│   │       ├── controller/  # REST API
│   │       └── dto/         # 데이터 전송 객체
│   ├── infrastructure/      # 외부 시스템 연동
│   └── security/           # 보안 관련
└── src/main/resources/
    ├── application.yml
    ├── application-[env].yml
    └── db/migration/
```

## 🔧 Common Configuration Templates

### 1. Application 메인 클래스

```java
package com.gigapress.[service];

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableFeignClients
@EnableKafka
@EnableAsync
@EnableScheduling
public class [Service]Application {
    
    public static void main(String[] args) {
        SpringApplication.run([Service]Application.class, args);
    }
}
```

### 2. Base Configuration

```java
// SecurityConfig.java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter(), 
                UsernamePasswordAuthenticationFilter.class)
            .build();
    }
    
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

// SwaggerConfig.java
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "[Service Name] API",
        version = "1.0.0",
        description = "[Service Description]"
    ),
    servers = {
        @Server(url = "http://localhost:808[x]", description = "Local server"),
        @Server(url = "https://api.gigapress.com", description = "Production server")
    }
)
public class SwaggerConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .components(new Components()
                .addSecuritySchemes("bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}

// DatabaseConfig.java
@Configuration
@EnableJpaRepositories(basePackages = "com.gigapress.[service].domain")
@EnableTransactionManagement
public class DatabaseConfig {
    
    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");
        config.setJdbcUrl("${spring.datasource.url}");
        config.setUsername("${spring.datasource.username}");
        config.setPassword("${spring.datasource.password}");
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);
        return new HikariDataSource(config);
    }
    
    @Bean
    public JPAQueryFactory jpaQueryFactory(EntityManager entityManager) {
        return new JPAQueryFactory(entityManager);
    }
}
```

### 3. Application Configuration

```yaml
# application.yml
server:
  port: 808[x]  # 각 서비스별 고유 포트

spring:
  application:
    name: [service-name]
  
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}
  
  datasource:
    url: jdbc:postgresql://localhost:5432/gigapress
    username: ${DB_USERNAME:gigapress}
    password: ${DB_PASSWORD:gigapress123}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        default_batch_fetch_size: 100
  
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:redis123}
    timeout: 3000ms
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
  
  kafka:
    bootstrap-servers: ${KAFKA_SERVERS:localhost:9092}
    consumer:
      group-id: ${spring.application.name}
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "*"
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

# Logging
logging:
  level:
    com.gigapress: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
  pattern:
    console: "%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} %clr(%5p) %clr(${PID:- }){magenta} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%n%wEx"

# Management
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enabled: true

# External Services
external:
  domain-schema:
    url: ${DOMAIN_SCHEMA_URL:http://localhost:8083}
  backend:
    url: ${BACKEND_URL:http://localhost:8084}
  ai-engine:
    url: ${AI_ENGINE_URL:http://localhost:8088}

# JWT
jwt:
  secret: ${JWT_SECRET:gigapress-super-secret-key-for-jwt-tokens}
  expiration: ${JWT_EXPIRATION:86400000} # 24 hours
```

## 📦 Domain Layer Templates

### 1. BaseEntity 상속

```java
package com.gigapress.[service].common.base;

import common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class GigaPressBaseEntity extends BaseEntity {
    
    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "updated_by")
    private String updatedBy;
    
    @PrePersist
    protected void prePersist() {
        super.prePersist();
        if (this.createdBy == null) {
            this.createdBy = getCurrentUser();
        }
        this.updatedBy = getCurrentUser();
    }
    
    @PreUpdate
    protected void preUpdate() {
        super.preUpdate();
        this.updatedBy = getCurrentUser();
    }
    
    private String getCurrentUser() {
        // SecurityContext에서 현재 사용자 정보 조회
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserDetails) {
                return ((UserDetails) auth.getPrincipal()).getUsername();
            }
        } catch (Exception e) {
            // 시스템 사용자로 fallback
        }
        return "system";
    }
}
```

### 2. Standard Entity Template

```java
package com.gigapress.[service].domain.[domain].entity;

import com.gigapress.[service].common.base.GigaPressBaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "[table_name]")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class [EntityName] extends GigaPressBaseEntity {
    
    @Id
    @GeneratedValue(generator = "common-id")
    @GenericGenerator(name = "common-id", strategy = "common.util.generator.CommonIdGenerator")
    @Column(name = "id")
    private Long id;
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    
    @Column(name = "description", length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private [Entity]Status status;
    
    // 비즈니스 메서드
    public void updateStatus([Entity]Status newStatus) {
        this.status = newStatus;
    }
    
    public boolean isActive() {
        return this.status == [Entity]Status.ACTIVE && this.useYn;
    }
}

// Enum
public enum [Entity]Status {
    ACTIVE, INACTIVE, PENDING, DELETED
}
```

### 3. Repository Template

```java
package com.gigapress.[service].domain.[domain].repository;

import com.gigapress.[service].domain.[domain].entity.[EntityName];
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface [EntityName]Repository extends 
    JpaRepository<[EntityName], Long>, 
    QuerydslPredicateExecutor<[EntityName]>,
    [EntityName]RepositoryCustom {
    
    // 기본 조회 메서드
    Optional<[EntityName]> findByIdAndUseYnTrue(Long id);
    
    List<[EntityName]> findByStatusAndUseYnTrueOrderByFrstRgstDtDesc([Entity]Status status);
    
    @Query("SELECT e FROM [EntityName] e WHERE e.name LIKE %:keyword% AND e.useYn = true")
    List<[EntityName]> findByNameContainingAndUseYnTrue(@Param("keyword") String keyword);
    
    boolean existsByNameAndUseYnTrue(String name);
}

// Custom Repository Interface
public interface [EntityName]RepositoryCustom {
    List<[EntityName]> findByComplexConditions([EntityName]SearchCondition condition);
    Page<[EntityName]> findPageByConditions([EntityName]SearchCondition condition, Pageable pageable);
}

// Custom Repository Implementation
@Repository
@RequiredArgsConstructor
public class [EntityName]RepositoryImpl implements [EntityName]RepositoryCustom {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<[EntityName]> findByComplexConditions([EntityName]SearchCondition condition) {
        Q[EntityName] entity = Q[EntityName].[entityName];
        
        return queryFactory
            .selectFrom(entity)
            .where(
                entity.useYn.isTrue(),
                nameContains(condition.getName()),
                statusEq(condition.getStatus()),
                createdDateBetween(condition.getStartDate(), condition.getEndDate())
            )
            .orderBy(entity.frstRgstDt.desc())
            .fetch();
    }
    
    private BooleanExpression nameContains(String name) {
        return StringUtils.hasText(name) ? 
            Q[EntityName].[entityName].name.containsIgnoreCase(name) : null;
    }
    
    private BooleanExpression statusEq([Entity]Status status) {
        return status != null ? Q[EntityName].[entityName].status.eq(status) : null;
    }
    
    private BooleanExpression createdDateBetween(LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null) {
            return Q[EntityName].[entityName].frstRgstDt.between(start, end);
        }
        return null;
    }
}
```

### 4. Service Template

```java
package com.gigapress.[service].domain.[domain].service;

import com.gigapress.[service].domain.[domain].entity.[EntityName];
import com.gigapress.[service].domain.[domain].repository.[EntityName]Repository;
import com.gigapress.[service].domain.[domain].dto.*;
import com.gigapress.[service].common.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class [EntityName]Service {
    
    private final [EntityName]Repository repository;
    private final [EntityName]Mapper mapper;
    
    @Transactional
    public [EntityName]Response create([EntityName]CreateRequest request) {
        log.info("Creating [EntityName]: {}", request.getName());
        
        // 비즈니스 규칙 검증
        validateCreateRequest(request);
        
        // 엔티티 생성
        [EntityName] entity = [EntityName].builder()
            .name(request.getName())
            .description(request.getDescription())
            .status([Entity]Status.ACTIVE)
            .build();
        
        // 저장
        [EntityName] saved = repository.save(entity);
        
        log.info("Created [EntityName] with id: {}", saved.getId());
        return mapper.toResponse(saved);
    }
    
    public [EntityName]Response getById(Long id) {
        [EntityName] entity = repository.findByIdAndUseYnTrue(id)
            .orElseThrow(() -> new EntityNotFoundException("[EntityName]", id));
        
        return mapper.toResponse(entity);
    }
    
    public Page<[EntityName]Response> getPage([EntityName]SearchRequest request, Pageable pageable) {
        [EntityName]SearchCondition condition = mapper.toSearchCondition(request);
        
        return repository.findPageByConditions(condition, pageable)
            .map(mapper::toResponse);
    }
    
    @Transactional
    public [EntityName]Response update(Long id, [EntityName]UpdateRequest request) {
        log.info("Updating [EntityName] id: {}", id);
        
        [EntityName] entity = repository.findByIdAndUseYnTrue(id)
            .orElseThrow(() -> new EntityNotFoundException("[EntityName]", id));
        
        // 업데이트
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        
        if (request.getStatus() != null) {
            entity.updateStatus(request.getStatus());
        }
        
        log.info("Updated [EntityName] id: {}", id);
        return mapper.toResponse(entity);
    }
    
    @Transactional
    public void delete(Long id) {
        log.info("Deleting [EntityName] id: {}", id);
        
        [EntityName] entity = repository.findByIdAndUseYnTrue(id)
            .orElseThrow(() -> new EntityNotFoundException("[EntityName]", id));
        
        // 소프트 삭제
        entity.setUseYn(false);
        
        log.info("Deleted [EntityName] id: {}", id);
    }
    
    private void validateCreateRequest([EntityName]CreateRequest request) {
        if (repository.existsByNameAndUseYnTrue(request.getName())) {
            throw new IllegalArgumentException("이미 존재하는 이름입니다: " + request.getName());
        }
    }
}
```

### 5. Controller Template

```java
package com.gigapress.[service].domain.[domain].controller;

import com.gigapress.[service].domain.[domain].service.[EntityName]Service;
import com.gigapress.[service].domain.[domain].dto.*;
import etners.ebmp.lib.api.basemodel.ResultModel;
import etners.ebmp.lib.api.factory.ResultModelFactoryG2;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/[entity-path]")
@RequiredArgsConstructor
@Validated
@Tag(name = "[EntityName] API", description = "[EntityName] 관리 API")
public class [EntityName]Controller {
    
    private final [EntityName]Service service;
    
    @PostMapping
    @Operation(summary = "[EntityName] 생성", description = "새로운 [EntityName]을 생성합니다.")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResultModel<[EntityName]Response> create(
            @Valid @RequestBody [EntityName]CreateRequest request) {
        
        [EntityName]Response response = service.create(request);
        return ResultModelFactoryG2.getSuccessResultModel(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "[EntityName] 조회", description = "ID로 [EntityName]을 조회합니다.")
    public ResultModel<[EntityName]Response> getById(
            @Parameter(description = "[EntityName] ID") @PathVariable Long id) {
        
        [EntityName]Response response = service.getById(id);
        return ResultModelFactoryG2.getSuccessResultModel(response);
    }
    
    @GetMapping
    @Operation(summary = "[EntityName] 목록 조회", description = "[EntityName] 목록을 페이징하여 조회합니다.")
    public ResultModel<Page<[EntityName]Response>> getPage(
            @ModelAttribute [EntityName]SearchRequest request,
            @PageableDefault(size = 20) Pageable pageable) {
        
        Page<[EntityName]Response> response = service.getPage(request, pageable);
        return ResultModelFactoryG2.getSuccessResultModel(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "[EntityName] 수정", description = "[EntityName] 정보를 수정합니다.")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResultModel<[EntityName]Response> update(
            @Parameter(description = "[EntityName] ID") @PathVariable Long id,
            @Valid @RequestBody [EntityName]UpdateRequest request) {
        
        [EntityName]Response response = service.update(id, request);
        return ResultModelFactoryG2.getSuccessResultModel(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "[EntityName] 삭제", description = "[EntityName]을 삭제합니다.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResultModel<Void> delete(
            @Parameter(description = "[EntityName] ID") @PathVariable Long id) {
        
        service.delete(id);
        return ResultModelFactoryG2.getSuccessResultModel();
    }
}
```

### 6. DTO Templates

```java
// Request DTOs
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class [EntityName]CreateRequest {
    
    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 255, message = "이름은 255자를 초과할 수 없습니다")
    private String name;
    
    @Size(max = 1000, message = "설명은 1000자를 초과할 수 없습니다")
    private String description;
}

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class [EntityName]UpdateRequest {
    
    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 255, message = "이름은 255자를 초과할 수 없습니다")
    private String name;
    
    @Size(max = 1000, message = "설명은 1000자를 초과할 수 없습니다")
    private String description;
    
    private [Entity]Status status;
}

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class [EntityName]SearchRequest {
    
    private String name;
    private [Entity]Status status;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startDate;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endDate;
}

// Response DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class [EntityName]Response {
    
    private Long id;
    private String name;
    private String description;
    private [Entity]Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
```

## 🔄 Event-Driven Architecture Templates

### 1. Event Classes

```java
// Base Event
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public abstract class BaseEvent {
    
    private String eventId;
    private String eventType;
    private LocalDateTime eventTime;
    private String source;
    private String version;
    
    @JsonIgnore
    public String getTopicName() {
        return this.getClass().getSimpleName().toLowerCase().replace("event", "");
    }
}

// Domain Event Example
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class [EntityName]CreatedEvent extends BaseEvent {
    
    private Long entityId;
    private String entityName;
    private String createdBy;
    private Map<String, Object> metadata;
    
    public static [EntityName]CreatedEvent from([EntityName] entity) {
        return [EntityName]CreatedEvent.builder()
            .eventId(UUID.randomUUID().toString())
            .eventType("[EntityName]Created")
            .eventTime(LocalDateTime.now())
            .source("[service-name]")
            .version("1.0")
            .entityId(entity.getId())
            .entityName(entity.getName())
            .createdBy(entity.getCreatedBy())
            .build();
    }
}
```

### 2. Event Publisher

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public void publishEvent(BaseEvent event) {
        try {
            String topicName = event.getTopicName();
            String key = generateEventKey(event);
            
            kafkaTemplate.send(topicName, key, event)
                .whenComplete((result, throwable) -> {
                    if (throwable != null) {
                        log.error("Failed to publish event: {}", event.getEventId(), throwable);
                    } else {
                        log.debug("Successfully published event: {} to topic: {}", 
                            event.getEventId(), topicName);
                    }
                });
                
        } catch (Exception e) {
            log.error("Error publishing event: {}", event.getEventId(), e);
        }
    }
    
    private String generateEventKey(BaseEvent event) {
        return event.getSource() + ":" + event.getEventType() + ":" + event.getEventId();
    }
}
```

### 3. Event Consumer

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class [EntityName]EventConsumer {
    
    private final [EntityName]Service service;
    
    @KafkaListener(topics = "[entity]created")
    public void handle[EntityName]CreatedEvent(
            @Payload [EntityName]CreatedEvent event,
            @Header KafkaHeaders headers) {
        
        log.info("Received [EntityName]CreatedEvent: {}", event.getEventId());
        
        try {
            // 이벤트 처리 로직
            processEntityCreated(event);
            
        } catch (Exception e) {
            log.error("Error processing [EntityName]CreatedEvent: {}", event.getEventId(), e);
            // 에러 처리 및 DLQ 발송 등
        }
    }
    
    private void processEntityCreated([EntityName]CreatedEvent event) {
        // 비즈니스 로직 처리
        log.info("Processing entity creation for: {}", event.getEntityName());
    }
}
```

## 🧪 Testing Templates

### 1. Unit Test Template

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("[EntityName]Service Unit Tests")
class [EntityName]ServiceTest {
    
    @Mock
    private [EntityName]Repository repository;
    
    @Mock
    private [EntityName]Mapper mapper;
    
    @InjectMocks
    private [EntityName]Service service;
    
    @Test
    @DisplayName("엔티티 생성 성공")
    void shouldCreateEntitySuccessfully() {
        // Given
        [EntityName]CreateRequest request = [EntityName]CreateRequest.builder()
            .name("Test Entity")
            .description("Test Description")
            .build();
            
        [EntityName] entity = [EntityName].builder()
            .id(1L)
            .name(request.getName())
            .description(request.getDescription())
            .status([Entity]Status.ACTIVE)
            .build();
            
        [EntityName]Response expectedResponse = [EntityName]Response.builder()
            .id(1L)
            .name("Test Entity")
            .description("Test Description")
            .status([Entity]Status.ACTIVE)
            .build();
        
        when(repository.existsByNameAndUseYnTrue(request.getName())).thenReturn(false);
        when(repository.save(any([EntityName].class))).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(expectedResponse);
        
        // When
        [EntityName]Response result = service.create(request);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Test Entity");
        
        verify(repository).existsByNameAndUseYnTrue(request.getName());
        verify(repository).save(any([EntityName].class));
        verify(mapper).toResponse(entity);
    }
    
    @Test
    @DisplayName("중복 이름으로 엔티티 생성 시 예외 발생")
    void shouldThrowExceptionWhenDuplicateName() {
        // Given
        [EntityName]CreateRequest request = [EntityName]CreateRequest.builder()
            .name("Duplicate Name")
            .build();
            
        when(repository.existsByNameAndUseYnTrue(request.getName())).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이미 존재하는 이름입니다");
            
        verify(repository).existsByNameAndUseYnTrue(request.getName());
        verify(repository, never()).save(any([EntityName].class));
    }
}
```

### 2. Integration Test Template

```java
@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}",
    "external.domain-schema.url=http://localhost:${wiremock.server.port}"
})
@EmbeddedKafka(partitions = 1, topics = {"[entity]created", "[entity]updated"})
@DisplayName("[EntityName] Integration Tests")
class [EntityName]IntegrationTest {
    
    @Autowired
    private [EntityName]Service service;
    
    @Autowired
    private [EntityName]Repository repository;
    
    @Autowired
    private TestEntityManager entityManager;
    
    @RegisterExtension
    static WireMockExtension wireMock = WireMockExtension.newInstance()
        .options(wireMockConfig().port(8089))
        .build();
    
    @Test
    @DisplayName("엔티티 생성부터 조회까지 전체 플로우 테스트")
    void shouldHandleCompleteEntityLifecycle() {
        // Given
        [EntityName]CreateRequest createRequest = [EntityName]CreateRequest.builder()
            .name("Integration Test Entity")
            .description("Integration Test Description")
            .build();
        
        // When - Create
        [EntityName]Response created = service.create(createRequest);
        entityManager.flush();
        entityManager.clear();
        
        // Then - Verify creation
        assertThat(created).isNotNull();
        assertThat(created.getId()).isNotNull();
        assertThat(created.getName()).isEqualTo("Integration Test Entity");
        
        // When - Retrieve
        [EntityName]Response retrieved = service.getById(created.getId());
        
        // Then - Verify retrieval
        assertThat(retrieved).isNotNull();
        assertThat(retrieved.getId()).isEqualTo(created.getId());
        assertThat(retrieved.getName()).isEqualTo(created.getName());
        
        // Verify database state
        Optional<[EntityName]> entityFromDb = repository.findById(created.getId());
        assertThat(entityFromDb).isPresent();
        assertThat(entityFromDb.get().getName()).isEqualTo("Integration Test Entity");
    }
}
```

## 📊 Monitoring Templates

### 1. Custom Health Indicator

```java
@Component
public class [Service]HealthIndicator implements HealthIndicator {
    
    private final [EntityName]Repository repository;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Override
    public Health health() {
        try {
            // Database health check
            long entityCount = repository.count();
            
            // Redis health check
            redisTemplate.opsForValue().get("health-check");
            
            return Health.up()
                .withDetail("database", "Available")
                .withDetail("redis", "Available")
                .withDetail("entity-count", entityCount)
                .build();
                
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

### 2. Custom Metrics

```java
@Component
@RequiredArgsConstructor
public class [Service]Metrics {
    
    private final MeterRegistry meterRegistry;
    private final Counter entityCreationCounter;
    private final Timer entityProcessingTimer;
    
    @PostConstruct
    public void initMetrics() {
        entityCreationCounter = Counter.builder("[service].entity.creation")
            .description("Number of entities created")
            .register(meterRegistry);
            
        entityProcessingTimer = Timer.builder("[service].entity.processing")
            .description("Time taken to process entities")
            .register(meterRegistry);
    }
    
    public void incrementEntityCreation() {
        entityCreationCounter.increment();
    }
    
    public Timer.Sample startProcessingTimer() {
        return Timer.start(meterRegistry);
    }
    
    public void recordProcessingTime(Timer.Sample sample) {
        sample.stop(entityProcessingTimer);
    }
}
```

## 🚀 Deployment Templates

### 1. Dockerfile

```dockerfile
FROM openjdk:17-jre-slim

# 작업 디렉토리 설정
WORKDIR /app

# 애플리케이션 JAR 파일 복사
COPY build/libs/[service-name]-*.jar app.jar

# 포트 노출
EXPOSE 808[x]

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:808[x]/actuator/health || exit 1

# JVM 옵션 설정
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:G1HeapRegionSize=16m"

# 애플리케이션 실행
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### 2. Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: [service-name]
  labels:
    app: [service-name]
    version: v1
spec:
  replicas: 2
  selector:
    matchLabels:
      app: [service-name]
  template:
    metadata:
      labels:
        app: [service-name]
        version: v1
    spec:
      containers:
      - name: [service-name]
        image: gigapress/[service-name]:latest
        ports:
        - containerPort: 808[x]
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi" 
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 808[x]
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 808[x]
          initialDelaySeconds: 10
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: [service-name]-service
spec:
  selector:
    app: [service-name]
  ports:
  - port: 808[x]
    targetPort: 808[x]
  type: ClusterIP
```

이 템플릿들을 사용하여 모든 GigaPress 서비스들이 일관된 구조와 패턴을 따를 수 있으며, `source` 디렉토리의 표준 프로젝트들과 동일한 아키텍처를 유지할 수 있습니다.