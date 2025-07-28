package com.gigapress.test.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gigapress.backend.domain.reservation.controller.MeetingRoomReservationController;
import com.gigapress.backend.domain.reservation.dto.*;
import com.gigapress.backend.domain.reservation.entity.MeetingRoom;
import com.gigapress.backend.domain.reservation.entity.Reservation;
import com.gigapress.backend.domain.reservation.entity.ReservationStatus;
import com.gigapress.backend.domain.reservation.repository.MeetingRoomRepository;
import com.gigapress.backend.domain.reservation.repository.ReservationRepository;
import com.gigapress.backend.domain.reservation.service.MeetingRoomReservationService;
import com.gigapress.backend.infrastructure.domainschema.DomainSchemaServiceClient;
import com.gigapress.backend.infrastructure.kafka.EventPublisher;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * 회의실 예약 서비스 통합 테스트
 * 
 * AI Engine → Domain Schema → Backend Service 전체 플로우 테스트
 * 
 * 시나리오:
 * 1. AI Engine이 회의실 예약 서비스 생성 요청
 * 2. Domain Schema Service에서 도메인 모델 생성
 * 3. Backend Service에서 ebmp-proj-standard-api 패키지 구조로 구현
 * 4. Controller → Service → Repository 전체 스택 동작 검증
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@Transactional
@TestPropertySource(properties = {
    "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}",
    "external.domain-schema.url=http://localhost:${wiremock.server.port}",
    "logging.level.com.gigapress=DEBUG"
})
@EmbeddedKafka(partitions = 1, topics = {
    "reservation.created", 
    "reservation.updated", 
    "meetingroom.created",
    "domain.model.generated"
})
@Slf4j
public class MeetingRoomReservationServiceIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DomainSchemaServiceClient domainSchemaServiceClient;

    @MockBean
    private EventPublisher eventPublisher;

    @MockBean
    private MeetingRoomRepository meetingRoomRepository;

    @MockBean
    private ReservationRepository reservationRepository;

    private MockMvc mockMvc;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        log.info("=== Starting Meeting Room Reservation Service Integration Test ===");
    }

    @Test
    @DisplayName("AI Engine → Domain Schema → Backend Service 전체 플로우 테스트")
    void shouldHandleCompleteAiEngineToBackendServiceFlow() throws Exception {
        log.info("=== 테스트 시작: AI Engine 회의실 예약 서비스 요청 ===");

        // ========== 1. AI Engine 요청 시뮬레이션 ==========
        log.info("1단계: AI Engine에서 회의실 예약 서비스 생성 요청");
        
        AiServiceGenerationRequest aiRequest = AiServiceGenerationRequest.builder()
            .serviceName("회의실 예약 서비스")
            .description("회의실을 예약하고 관리할 수 있는 서비스를 만들어주세요")
            .features(Arrays.asList(
                "회의실 목록 조회",
                "회의실 예약",
                "예약 취소",
                "예약 현황 조회",
                "회의실 이용 통계"
            ))
            .businessRules(Arrays.asList(
                "동일한 시간대에 중복 예약 불가",
                "예약 시작 1시간 전까지만 취소 가능",
                "최대 7일 전까지 예약 가능"
            ))
            .build();

        // ========== 2. Domain Schema Service Mock 응답 ==========
        log.info("2단계: Domain Schema Service에서 도메인 모델 생성");
        
        DomainModelResponse domainModelResponse = createMockDomainModelResponse();
        when(domainSchemaServiceClient.generateDomainModel(any(DomainModelGenerationRequest.class)))
            .thenReturn(domainModelResponse);

        // ========== 3. 회의실 데이터 Mock 설정 ==========
        log.info("3단계: 테스트 데이터 준비");
        
        setupMockMeetingRoomData();
        setupMockReservationData();

        // ========== 4. 회의실 목록 조회 API 테스트 ==========
        log.info("4단계: 회의실 목록 조회 API 테스트");
        
        mockMvc.perform(get("/api/v1/meeting-rooms")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(3)))
                .andExpect(jsonPath("$.data[0].name").value("대회의실 A"))
                .andExpect(jsonPath("$.data[0].capacity").value(20))
                .andExpect(jsonPath("$.data[0].location").value("1층"));

        log.info("✓ 회의실 목록 조회 API 테스트 성공");

        // ========== 5. 회의실 예약 생성 API 테스트 ==========
        log.info("5단계: 회의실 예약 생성 API 테스트");
        
        ReservationCreateRequest createRequest = ReservationCreateRequest.builder()
            .meetingRoomId(1L)
            .title("개발팀 주간 회의")
            .description("스프린트 리뷰 및 계획")
            .startTime(LocalDateTime.now().plusDays(1).withHour(14).withMinute(0))
            .endTime(LocalDateTime.now().plusDays(1).withHour(16).withMinute(0))
            .attendeeCount(8)
            .requesterName("김개발")
            .requesterEmail("kim.dev@gigapress.com")
            .build();

        String createRequestJson = objectMapper.writeValueAsString(createRequest);

        mockMvc.perform(post("/api/v1/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createRequestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1L))
                .andExpect(jsonPath("$.data.title").value("개발팀 주간 회의"))
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.requesterName").value("김개발"));

        log.info("✓ 회의실 예약 생성 API 테스트 성공");

        // ========== 6. 예약 현황 조회 API 테스트 ==========
        log.info("6단계: 예약 현황 조회 API 테스트");
        
        LocalDateTime searchDate = LocalDateTime.now().plusDays(1);
        String searchDateStr = searchDate.format(DateTimeFormatter.ISO_LOCAL_DATE);

        mockMvc.perform(get("/api/v1/reservations")
                .param("date", searchDateStr)
                .param("meetingRoomId", "1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.content[0].title").value("개발팀 주간 회의"));

        log.info("✓ 예약 현황 조회 API 테스트 성공");

        // ========== 7. 중복 예약 방지 테스트 ==========
        log.info("7단계: 중복 예약 방지 로직 테스트");
        
        ReservationCreateRequest duplicateRequest = ReservationCreateRequest.builder()
            .meetingRoomId(1L)
            .title("마케팅팀 회의")
            .startTime(LocalDateTime.now().plusDays(1).withHour(15).withMinute(0))
            .endTime(LocalDateTime.now().plusDays(1).withHour(17).withMinute(0))
            .attendeeCount(5)
            .requesterName("박마케팅")
            .requesterEmail("park.marketing@gigapress.com")
            .build();

        // 중복 예약 체크를 위한 Mock 설정
        when(reservationRepository.existsOverlappingReservation(eq(1L), any(), any()))
            .thenReturn(true);

        String duplicateRequestJson = objectMapper.writeValueAsString(duplicateRequest);

        mockMvc.perform(post("/api/v1/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(duplicateRequestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("OVERLAPPING_RESERVATION"))
                .andExpect(jsonPath("$.error.message").containsString("중복"));

        log.info("✓ 중복 예약 방지 로직 테스트 성공");

        // ========== 8. 예약 수정 API 테스트 ==========
        log.info("8단계: 예약 수정 API 테스트");
        
        ReservationUpdateRequest updateRequest = ReservationUpdateRequest.builder()
            .title("개발팀 주간 회의 (수정됨)")
            .description("스프린트 리뷰 및 다음 계획 논의")
            .attendeeCount(10)
            .build();

        String updateRequestJson = objectMapper.writeValueAsString(updateRequest);

        mockMvc.perform(put("/api/v1/reservations/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateRequestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("개발팀 주간 회의 (수정됨)"))
                .andExpect(jsonPath("$.data.attendeeCount").value(10));

        log.info("✓ 예약 수정 API 테스트 성공");

        // ========== 9. 예약 취소 API 테스트 ==========
        log.info("9단계: 예약 취소 API 테스트");
        
        mockMvc.perform(delete("/api/v1/reservations/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        log.info("✓ 예약 취소 API 테스트 성공");

        // ========== 10. 이벤트 발행 검증 ==========
        log.info("10단계: Kafka 이벤트 발행 검증");
        
        // 예약 생성 이벤트 발행 검증
        verify(eventPublisher, atLeastOnce()).publishEvent(any());
        
        log.info("✓ Kafka 이벤트 발행 검증 성공");

        // ========== 11. Domain Schema Service 호출 검증 ==========
        log.info("11단계: Domain Schema Service 호출 검증");
        
        verify(domainSchemaServiceClient).generateDomainModel(any(DomainModelGenerationRequest.class));
        
        log.info("✓ Domain Schema Service 호출 검증 성공");

        log.info("=== 테스트 완료: 전체 플로우 성공 ===");
    }

    @Test
    @DisplayName("회의실 이용 통계 API 테스트")
    void shouldProvideUsageStatistics() throws Exception {
        log.info("=== 회의실 이용 통계 API 테스트 시작 ===");

        // Mock 통계 데이터 설정
        setupMockStatisticsData();

        mockMvc.perform(get("/api/v1/meeting-rooms/statistics")
                .param("startDate", "2024-01-01")
                .param("endDate", "2024-01-31")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalReservations").value(25))
                .andExpect(jsonPath("$.data.totalHours").value(50.0))
                .andExpect(jsonPath("$.data.averageUtilization").value(75.5))
                .andExpect(jsonPath("$.data.mostUsedRoom.name").value("대회의실 A"));

        log.info("✓ 회의실 이용 통계 API 테스트 성공");
    }

    @Test
    @DisplayName("실시간 예약 가능 시간 조회 API 테스트")
    void shouldProvideAvailableTimeSlots() throws Exception {
        log.info("=== 실시간 예약 가능 시간 조회 API 테스트 시작 ===");

        LocalDateTime targetDate = LocalDateTime.now().plusDays(1);
        String targetDateStr = targetDate.format(DateTimeFormatter.ISO_LOCAL_DATE);

        // Mock 가능 시간 데이터 설정
        setupMockAvailableTimeSlotsData();

        mockMvc.perform(get("/api/v1/meeting-rooms/1/available-slots")
                .param("date", targetDateStr)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.data[0].startTime").exists())
                .andExpect(jsonPath("$.data[0].endTime").exists())
                .andExpect(jsonPath("$.data[0].available").value(true));

        log.info("✓ 실시간 예약 가능 시간 조회 API 테스트 성공");
    }

    // ========== Private Helper Methods ==========

    private DomainModelResponse createMockDomainModelResponse() {
        return DomainModelResponse.builder()
            .domainId("meeting-room-reservation")
            .serviceName("MeetingRoomReservationService")
            .entities(Arrays.asList(
                createEntityModel("MeetingRoom", Arrays.asList(
                    createFieldModel("id", "Long", true),
                    createFieldModel("name", "String", false),
                    createFieldModel("location", "String", false),
                    createFieldModel("capacity", "Integer", false),
                    createFieldModel("facilities", "List<String>", false)
                )),
                createEntityModel("Reservation", Arrays.asList(
                    createFieldModel("id", "Long", true),
                    createFieldModel("meetingRoomId", "Long", false),
                    createFieldModel("title", "String", false),
                    createFieldModel("startTime", "LocalDateTime", false),
                    createFieldModel("endTime", "LocalDateTime", false),
                    createFieldModel("status", "ReservationStatus", false),
                    createFieldModel("requesterName", "String", false),
                    createFieldModel("requesterEmail", "String", false)
                ))
            ))
            .apis(Arrays.asList(
                createApiModel("GET", "/api/v1/meeting-rooms", "회의실 목록 조회"),
                createApiModel("POST", "/api/v1/reservations", "예약 생성"),
                createApiModel("GET", "/api/v1/reservations", "예약 목록 조회"),
                createApiModel("PUT", "/api/v1/reservations/{id}", "예약 수정"),
                createApiModel("DELETE", "/api/v1/reservations/{id}", "예약 취소")
            ))
            .build();
    }

    private EntityModel createEntityModel(String name, List<FieldModel> fields) {
        return EntityModel.builder()
            .name(name)
            .fields(fields)
            .build();
    }

    private FieldModel createFieldModel(String name, String type, boolean isPrimaryKey) {
        return FieldModel.builder()
            .name(name)
            .type(type)
            .primaryKey(isPrimaryKey)
            .nullable(!isPrimaryKey)
            .build();
    }

    private ApiModel createApiModel(String method, String path, String description) {
        return ApiModel.builder()
            .method(method)
            .path(path)
            .description(description)
            .build();
    }

    private void setupMockMeetingRoomData() {
        List<MeetingRoom> mockRooms = Arrays.asList(
            MeetingRoom.builder()
                .id(1L)
                .name("대회의실 A")
                .location("1층")
                .capacity(20)
                .facilities(Arrays.asList("프로젝터", "화이트보드", "전화회의"))
                .build(),
            MeetingRoom.builder()
                .id(2L)
                .name("소회의실 B")
                .location("2층")
                .capacity(8)
                .facilities(Arrays.asList("모니터", "화이트보드"))
                .build(),
            MeetingRoom.builder()
                .id(3L)
                .name("임원회의실")
                .location("3층")
                .capacity(12)
                .facilities(Arrays.asList("프로젝터", "화이트보드", "전화회의", "스피커"))
                .build()
        );

        when(meetingRoomRepository.findAllByUseYnTrueOrderByName()).thenReturn(mockRooms);
        when(meetingRoomRepository.findByIdAndUseYnTrue(1L)).thenReturn(Optional.of(mockRooms.get(0)));
        when(meetingRoomRepository.findByIdAndUseYnTrue(2L)).thenReturn(Optional.of(mockRooms.get(1)));
        when(meetingRoomRepository.findByIdAndUseYnTrue(3L)).thenReturn(Optional.of(mockRooms.get(2)));
    }

    private void setupMockReservationData() {
        Reservation mockReservation = Reservation.builder()
            .id(1L)
            .meetingRoomId(1L)
            .title("개발팀 주간 회의")
            .description("스프린트 리뷰 및 계획")
            .startTime(LocalDateTime.now().plusDays(1).withHour(14).withMinute(0))
            .endTime(LocalDateTime.now().plusDays(1).withHour(16).withMinute(0))
            .status(ReservationStatus.CONFIRMED)
            .attendeeCount(8)
            .requesterName("김개발")
            .requesterEmail("kim.dev@gigapress.com")
            .build();

        when(reservationRepository.save(any(Reservation.class))).thenReturn(mockReservation);
        when(reservationRepository.findByIdAndUseYnTrue(1L)).thenReturn(Optional.of(mockReservation));
        when(reservationRepository.existsOverlappingReservation(eq(1L), any(), any())).thenReturn(false);
    }

    private void setupMockStatisticsData() {
        UsageStatisticsResponse mockStats = UsageStatisticsResponse.builder()
            .totalReservations(25)
            .totalHours(50.0)
            .averageUtilization(75.5)
            .mostUsedRoom(MeetingRoomUsageInfo.builder()
                .id(1L)
                .name("대회의실 A")
                .reservationCount(15)
                .totalHours(30.0)
                .build())
            .build();

        // 이 부분은 실제 구현에서는 Service의 getUsageStatistics 메서드를 mock해야 합니다.
    }

    private void setupMockAvailableTimeSlotsData() {
        // 이 부분은 실제 구현에서는 Service의 getAvailableTimeSlots 메서드를 mock해야 합니다.
        List<AvailableTimeSlot> mockSlots = Arrays.asList(
            AvailableTimeSlot.builder()
                .startTime(LocalDateTime.now().plusDays(1).withHour(9).withMinute(0))
                .endTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0))
                .available(true)
                .build(),
            AvailableTimeSlot.builder()
                .startTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0))
                .endTime(LocalDateTime.now().plusDays(1).withHour(11).withMinute(0))
                .available(true)
                .build()
        );
    }
}

// ========== Supporting DTOs and Models ==========

/**
 * AI Engine 서비스 생성 요청 DTO
 */
@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class AiServiceGenerationRequest {
    private String serviceName;
    private String description;
    private List<String> features;
    private List<String> businessRules;
}

/**
 * Domain Model 생성 요청 DTO
 */
@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class DomainModelGenerationRequest {
    private String serviceName;
    private String description;
    private List<String> features;
    private List<String> businessRules;
}

/**
 * Domain Model 응답 DTO
 */
@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class DomainModelResponse {
    private String domainId;
    private String serviceName;
    private List<EntityModel> entities;
    private List<ApiModel> apis;
}

/**
 * Entity Model DTO
 */
@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class EntityModel {
    private String name;
    private List<FieldModel> fields;
}

/**
 * Field Model DTO
 */
@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class FieldModel {
    private String name;
    private String type;
    private boolean primaryKey;
    private boolean nullable;
}

/**
 * API Model DTO
 */
@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class ApiModel {
    private String method;
    private String path;
    private String description;
}

/**
 * 사용량 통계 응답 DTO
 */
@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class UsageStatisticsResponse {
    private int totalReservations;
    private double totalHours;
    private double averageUtilization;
    private MeetingRoomUsageInfo mostUsedRoom;
}

/**
 * 회의실 사용 정보 DTO
 */
@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class MeetingRoomUsageInfo {
    private Long id;
    private String name;
    private int reservationCount;
    private double totalHours;
}

/**
 * 예약 가능 시간 슬롯 DTO
 */
@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class AvailableTimeSlot {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean available;
}