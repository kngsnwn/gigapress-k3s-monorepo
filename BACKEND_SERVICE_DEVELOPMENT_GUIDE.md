# Backend Service Development Guide

## 📋 Overview

GigaPress Backend Service는 `source` 디렉토리의 두 표준 프로젝트를 기반으로 개발됩니다:
- **ebmp-lib-common-module**: 공통 라이브러리 모듈
- **ebmp-proj-standard-api**: 표준 프로젝트 API 템플릿

이 가이드는 표준 구조와 패턴을 유지하면서 GigaPress 특화 비즈니스 로직을 추가하는 방법을 제시합니다.

## 🏗️ Architecture Overview

### 하이브리드 아키텍처 패턴

```
com.gigapress.backend/
├── common/              # 공통 모듈 (ebmp-lib-common-module 기반)
├── config/              # 설정 클래스들
├── security/            # JWT 기반 인증/인가
├── domain/              # 도메인별 구조
│   ├── api/            # API 생성 도메인 (DDD 패턴)
│   ├── project/        # 프로젝트 관리 도메인 (DDD 패턴)
│   └── template/       # 템플릿 관리 도메인 (MVC 패턴)
└── infrastructure/      # 외부 시스템 연동
    ├── domain-schema/   # Domain Schema Service 연동
    └── kafka/          # Kafka 메시지 처리
```

## 🔧 Core Dependencies

### build.gradle 기본 구성

```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.2'
    id 'io.spring.dependency-management' version '1.1.4'
}

group = 'com.gigapress'
version = '1.0.0'
sourceCompatibility = '17'

dependencies {
    // ebmp-lib-common-module 의존성
    implementation project(':ebmp-lib-common-module')
    
    // Spring Boot Core
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    
    // QueryDSL
    implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
    annotationProcessor 'com.querydsl:querydsl-apt:5.0.0:jakarta'
    
    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'
    
    // Kafka
    implementation 'org.springframework.kafka:spring-kafka'
    
    // Database
    runtimeOnly 'org.postgresql:postgresql'
    
    // OpenAPI Documentation
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'
    
    // Test Dependencies
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.kafka:spring-kafka-test'
}
```

## 📦 Package Structure

### 1. Common 모듈 구조

```java
// BaseEntity 상속 사용
@Entity
@Table(name = "api_specifications")
public class ApiSpecification extends BaseEntity {
    @Id
    @GeneratedValue(generator = "common-id")
    private Long id;
    
    private String name;
    private String description;
    // ... 비즈니스 필드들
}
```

### 2. Security 설정

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter(), 
                UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

### 3. Domain 구조 (DDD 패턴)

#### API Generation Domain 예시

```java
// 1. Domain Entity
@Entity
@Table(name = "api_specifications")
public class ApiSpecification extends BaseEntity {
    @Id
    @GeneratedValue(generator = "common-id")
    private Long id;
    
    @Column(nullable = false)
    private String projectId;
    
    @Enumerated(EnumType.STRING)
    private ApiType apiType;
    
    @Embedded
    private ApiMetadata metadata;
    
    // Domain methods
    public GeneratedApi generateApi(ApiPattern pattern) {
        // 비즈니스 로직
        return new GeneratedApi(this, pattern);
    }
}

// 2. Command/Info 객체
public class ApiSpecificationCommand {
    @NotBlank
    private String projectId;
    
    @NotNull
    private ApiType apiType;
    
    private ApiMetadata metadata;
    
    // getters/setters
}

public class ApiSpecificationInfo {
    private Long id;
    private String projectId;
    private ApiType apiType;
    private LocalDateTime createdAt;
    
    // getters
}

// 3. Domain Service
@Service
@Transactional
public class ApiSpecificationService {
    
    private final ApiSpecificationReader reader;
    private final ApiSpecificationStore store;
    private final ApiPatternService patternService;
    
    public ApiSpecificationInfo createApiSpecification(ApiSpecificationCommand command) {
        // 도메인 로직
        var specification = ApiSpecification.builder()
            .projectId(command.getProjectId())
            .apiType(command.getApiType())
            .metadata(command.getMetadata())
            .build();
            
        var saved = store.save(specification);
        return ApiSpecificationInfo.from(saved);
    }
    
    public GeneratedApi generateApi(Long specificationId, ApiPattern pattern) {
        var specification = reader.getById(specificationId);
        return specification.generateApi(pattern);
    }
}

// 4. Repository Interface (Domain Layer)
public interface ApiSpecificationReader {
    ApiSpecification getById(Long id);
    List<ApiSpecification> getByProjectId(String projectId);
    Page<ApiSpecification> getPage(Pageable pageable);
}

public interface ApiSpecificationStore {
    ApiSpecification save(ApiSpecification specification);
    void delete(Long id);
}

// 5. Repository Implementation (Infrastructure Layer)
@Repository
@Transactional(readOnly = true)
public class ApiSpecificationReaderImpl implements ApiSpecificationReader {
    
    private final ApiSpecificationRepository repository;
    private final JPAQueryFactory queryFactory;
    
    @Override
    public ApiSpecification getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("ApiSpecification", id));
    }
    
    @Override
    public List<ApiSpecification> getByProjectId(String projectId) {
        QApiSpecification spec = QApiSpecification.apiSpecification;
        
        return queryFactory
            .selectFrom(spec)
            .where(spec.projectId.eq(projectId)
                .and(spec.useYn.isTrue()))
            .orderBy(spec.frstRgstDt.desc())
            .fetch();
    }
}

// 6. Application Service (Facade)
@Service
@Transactional
public class ApiGenerationFacade {
    
    private final ApiSpecificationService specificationService;
    private final ApiTemplateService templateService;
    private final DomainSchemaServiceClient domainSchemaClient;
    private final KafkaProducerService kafkaProducer;
    
    public ApiGenerationResult generateApiFromSpec(ApiGenerationCommand command) {
        try {
            // 1. Domain Schema 조회
            var domainModel = domainSchemaClient.getDomainModel(command.getProjectId());
            
            // 2. API 스펙 생성
            var specCommand = ApiSpecificationCommand.builder()
                .projectId(command.getProjectId())
                .apiType(command.getApiType())
                .metadata(ApiMetadata.from(domainModel))
                .build();
                
            var specification = specificationService.createApiSpecification(specCommand);
            
            // 3. 템플릿 기반 API 생성
            var pattern = templateService.getApiPattern(command.getApiType());
            var generatedApi = specificationService.generateApi(specification.getId(), pattern);
            
            // 4. 결과 이벤트 발행
            kafkaProducer.publishApiGeneratedEvent(
                ApiGeneratedEvent.builder()
                    .specificationId(specification.getId())
                    .projectId(command.getProjectId())
                    .generatedFiles(generatedApi.getFiles())
                    .build()
            );
            
            return ApiGenerationResult.success(specification, generatedApi);
            
        } catch (Exception e) {
            log.error("API 생성 실패: {}", e.getMessage(), e);
            return ApiGenerationResult.failure(e.getMessage());
        }
    }
}

// 7. Controller (Interface Layer)
@RestController
@RequestMapping("/api/v1/api-generation")
@RequiredArgsConstructor
@Validated
public class ApiGenerationController extends BaseController {
    
    private final ApiGenerationFacade apiGenerationFacade;
    
    @PostMapping
    @Operation(summary = "API 생성", description = "프로젝트의 도메인 모델을 기반으로 API를 생성합니다.")
    public ResultModel<ApiGenerationResponse> generateApi(
            @Valid @RequestBody ApiGenerationRequest request) {
        
        var command = ApiGenerationCommand.builder()
            .projectId(request.getProjectId())
            .apiType(request.getApiType())
            .templateId(request.getTemplateId())
            .build();
            
        var result = apiGenerationFacade.generateApiFromSpec(command);
        
        if (result.isSuccess()) {
            var response = ApiGenerationResponse.from(result);
            return ResultModel.success(response);
        } else {
            return ResultModel.error(ErrorCode.API_GENERATION_FAILED, result.getErrorMessage());
        }
    }
    
    @GetMapping("/{projectId}/specifications")
    @Operation(summary = "API 스펙 목록 조회")
    public ResultModel<List<ApiSpecificationResponse>> getApiSpecifications(
            @PathVariable String projectId) {
        
        var specifications = apiGenerationFacade.getApiSpecifications(projectId);
        var responses = specifications.stream()
            .map(ApiSpecificationResponse::from)
            .toList();
            
        return ResultModel.success(responses);
    }
}
```

### 4. Configuration 설정

```java
// Application 메인 클래스
@SpringBootApplication
@EnableJpaAuditing
@EnableKafka
@EnableScheduling
@EnableAsync
public class BackendServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendServiceApplication.class, args);
    }
}

// Kafka 설정
@Configuration
@EnableKafka
@RequiredArgsConstructor
public class KafkaConfig {
    
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;
    
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }
    
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}

// External Client 설정
@FeignClient(name = "domain-schema-service", url = "${external.domain-schema.url}")
public interface DomainSchemaServiceClient {
    
    @GetMapping("/api/v1/domain-models/{projectId}")
    DomainModelResponse getDomainModel(@PathVariable String projectId);
    
    @PostMapping("/api/v1/domain-models/{projectId}/analyze")
    AnalysisResultResponse analyzeDomainModel(
        @PathVariable String projectId,
        @RequestBody AnalyzeRequest request
    );
}
```

## 🔄 Event-Driven Architecture

### Kafka Event 처리

```java
// Event 정의
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiGeneratedEvent {
    private Long specificationId;
    private String projectId;
    private List<GeneratedFile> generatedFiles;
    private LocalDateTime generatedAt;
    
    // builder pattern
}

// Event Producer
@Service
@RequiredArgsConstructor
public class KafkaProducerService {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public void publishApiGeneratedEvent(ApiGeneratedEvent event) {
        kafkaTemplate.send("api.generated", event.getProjectId(), event);
    }
}

// Event Consumer
@Service
@KafkaListener(topics = "domain.model.updated")
public class DomainModelEventConsumer {
    
    private final ApiSpecificationService apiSpecificationService;
    
    @KafkaHandler
    public void handle(DomainModelUpdatedEvent event) {
        log.info("도메인 모델 업데이트 이벤트 수신: {}", event.getProjectId());
        
        // 관련 API 스펙들 업데이트
        apiSpecificationService.updateSpecificationsForProject(event.getProjectId());
    }
}
```

## 🧪 Testing Strategy

### 테스트 구조

```java
// 통합 테스트
@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}",
    "external.domain-schema.url=http://localhost:${wiremock.server.port}"
})
@EmbeddedKafka(partitions = 1, topics = {"api.generated", "domain.model.updated"})
class ApiGenerationIntegrationTest {
    
    @Autowired
    private ApiGenerationFacade apiGenerationFacade;
    
    @RegisterExtension
    static WireMockExtension wireMock = WireMockExtension.newInstance()
        .options(wireMockConfig().port(8089))
        .build();
    
    @Test
    void shouldGenerateApiSuccessfully() {
        // Given
        wireMock.stubFor(get(urlPathMatching("/api/v1/domain-models/.*"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody(readTestResource("domain-model-response.json"))));
        
        var command = ApiGenerationCommand.builder()
            .projectId("test-project")
            .apiType(ApiType.REST_API)
            .build();
        
        // When
        var result = apiGenerationFacade.generateApiFromSpec(command);
        
        // Then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getSpecification()).isNotNull();
        assertThat(result.getGeneratedApi().getFiles()).isNotEmpty();
    }
}

// 단위 테스트
@ExtendWith(MockitoExtension.class)
class ApiSpecificationServiceTest {
    
    @Mock
    private ApiSpecificationReader reader;
    
    @Mock
    private ApiSpecificationStore store;
    
    @InjectMocks
    private ApiSpecificationService service;
    
    @Test
    void shouldCreateApiSpecification() {
        // Given
        var command = ApiSpecificationCommand.builder()
            .projectId("test-project")
            .apiType(ApiType.REST_API)
            .build();
        
        var specification = ApiSpecification.builder()
            .id(1L)
            .projectId(command.getProjectId())
            .apiType(command.getApiType())
            .build();
        
        when(store.save(any(ApiSpecification.class))).thenReturn(specification);
        
        // When
        var result = service.createApiSpecification(command);
        
        // Then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getProjectId()).isEqualTo("test-project");
        verify(store).save(any(ApiSpecification.class));
    }
}
```

## 📊 Monitoring & Observability

### Actuator 설정

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,kafka
  endpoint:
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enabled: true
```

### Custom Health Indicators

```java
@Component
public class DomainSchemaServiceHealthIndicator implements HealthIndicator {
    
    private final DomainSchemaServiceClient client;
    
    @Override
    public Health health() {
        try {
            // 헬스체크 호출
            client.healthCheck();
            return Health.up()
                .withDetail("domain-schema-service", "Available")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("domain-schema-service", "Unavailable")
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

## 🚀 Deployment

### Docker Configuration

```dockerfile
FROM openjdk:17-jre-slim

WORKDIR /app

COPY build/libs/backend-service-*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend-service
  template:
    metadata:
      labels:
        app: backend-service
    spec:
      containers:
      - name: backend-service
        image: gigapress/backend-service:latest
        ports:
        - containerPort: 8084
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
```

## 📝 Development Guidelines

### 1. 코딩 컨벤션
- **Package Naming**: `com.gigapress.backend.domain.[도메인명]`
- **Class Naming**: 
  - Entity: `[DomainName]`
  - Service: `[DomainName]Service`
  - Controller: `[DomainName]Controller`
  - Repository: `[DomainName]Repository`

### 2. API 설계 원칙
- **RESTful API**: HTTP Method와 상태코드 준수
- **버전 관리**: `/api/v1/` prefix 사용
- **응답 형식**: `ResultModel<T>` 래핑
- **에러 처리**: 표준화된 ErrorCode 사용

### 3. 보안 가이드라인
- **JWT 토큰**: 모든 API 인증 필수
- **입력 검증**: `@Valid`, `@Validated` 사용
- **SQL Injection**: QueryDSL 사용으로 방지
- **민감 정보**: 환경변수나 Vault 사용

### 4. 성능 최적화
- **N+1 문제**: `@EntityGraph`, `fetch join` 활용
- **캐싱**: Redis 캐시 적극 활용
- **비동기 처리**: `@Async`, Kafka 이벤트 활용
- **데이터베이스**: 인덱스 최적화

## 🔗 Integration Points

### 1. Domain Schema Service
- **용도**: 도메인 모델 조회/분석
- **프로토콜**: HTTP REST API
- **인증**: JWT 토큰 전달

### 2. Conversational AI Engine
- **용도**: AI 기반 코드 생성 요청
- **프로토콜**: WebSocket 또는 HTTP
- **데이터**: JSON 형식

### 3. Kafka Message Broker
- **Topics**: 
  - `api.generated`: API 생성 완료 이벤트
  - `domain.model.updated`: 도메인 모델 변경 이벤트
  - `project.created`: 프로젝트 생성 이벤트

이 가이드를 따라 개발하면 기존 표준 프로젝트의 검증된 패턴과 구조를 유지하면서 GigaPress만의 비즈니스 로직을 효과적으로 구현할 수 있습니다.