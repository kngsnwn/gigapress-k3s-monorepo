package etners.reservation.controller;

import etners.ebmp.lib.api.basemodel.ResultModel;
import etners.ebmp.lib.api.factory.ResultModelFactoryG2;
import etners.reservation.dto.*;
import etners.reservation.service.MeetingRoomReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 회의실 예약 관리 Controller
 * 
 * AI Engine → Domain Schema → Backend Service 플로우에서 생성된
 * 회의실 예약 서비스의 REST API Controller
 * 
 * 기능:
 * - 회의실 목록 조회
 * - 회의실 예약 생성/수정/취소
 * - 예약 현황 조회
 * - 실시간 예약 가능 시간 조회
 * - 회의실 이용 통계
 * 
 * @author AI Engine Generated
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Meeting Room Reservation API", description = "회의실 예약 관리 API")
public class MeetingRoomReservationController {

    private final MeetingRoomReservationService reservationService;

    // ========== 회의실 관리 API ==========

    @GetMapping("/meeting-rooms")
    @Operation(
        summary = "회의실 목록 조회", 
        description = "사용 가능한 모든 회의실 목록을 조회합니다."
    )
    public ResultModel<List<MeetingRoomResponse>> getAllMeetingRooms() {
        log.info("회의실 목록 조회 요청");
        
        List<MeetingRoomResponse> meetingRooms = reservationService.getAllMeetingRooms();
        
        log.info("회의실 목록 조회 완료: {} 개", meetingRooms.size());
        return ResultModelFactoryG2.getSuccessResultModel(meetingRooms);
    }

    @GetMapping("/meeting-rooms/{id}")
    @Operation(
        summary = "회의실 상세 정보 조회", 
        description = "특정 회의실의 상세 정보를 조회합니다."
    )
    public ResultModel<MeetingRoomResponse> getMeetingRoom(
            @Parameter(description = "회의실 ID") @PathVariable Long id) {
        
        log.info("회의실 상세 정보 조회 요청: {}", id);
        
        MeetingRoomResponse meetingRoom = reservationService.getMeetingRoomById(id);
        
        log.info("회의실 상세 정보 조회 완료: {}", meetingRoom.getName());
        return ResultModelFactoryG2.getSuccessResultModel(meetingRoom);
    }

    @PostMapping("/meeting-rooms")
    @Operation(
        summary = "회의실 등록", 
        description = "새로운 회의실을 등록합니다."
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResultModel<MeetingRoomResponse> createMeetingRoom(
            @Valid @RequestBody MeetingRoomCreateRequest request) {
        
        log.info("회의실 등록 요청: {}", request.getName());
        
        MeetingRoomResponse createdRoom = reservationService.createMeetingRoom(request);
        
        log.info("회의실 등록 완료: {}", createdRoom.getName());
        return ResultModelFactoryG2.getSuccessResultModel(createdRoom);
    }

    // ========== 예약 관리 API ==========

    @PostMapping("/reservations")
    @Operation(
        summary = "회의실 예약", 
        description = "회의실을 예약합니다. 중복 시간대 예약은 불가능합니다."
    )
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResultModel<ReservationResponse> createReservation(
            @Valid @RequestBody ReservationCreateRequest request) {
        
        log.info("회의실 예약 요청: {} - {}", request.getTitle(), request.getMeetingRoomId());
        
        ReservationResponse reservation = reservationService.createReservation(request);
        
        log.info("회의실 예약 완료: {} (ID: {})", reservation.getTitle(), reservation.getId());
        return ResultModelFactoryG2.getSuccessResultModel(reservation, HttpStatus.CREATED);
    }

    @GetMapping("/reservations")
    @Operation(
        summary = "예약 목록 조회", 
        description = "조건에 따른 예약 목록을 페이징하여 조회합니다."
    )
    public ResultModel<Page<ReservationResponse>> getReservations(
            @ModelAttribute ReservationSearchRequest searchRequest,
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.info("예약 목록 조회 요청: {}", searchRequest);
        
        Page<ReservationResponse> reservations = reservationService.getReservations(searchRequest, pageable);
        
        log.info("예약 목록 조회 완료: {} 건", reservations.getTotalElements());
        return ResultModelFactoryG2.getSuccessResultModel(reservations);
    }

    @GetMapping("/reservations/{id}")
    @Operation(
        summary = "예약 상세 정보 조회", 
        description = "특정 예약의 상세 정보를 조회합니다."
    )
    public ResultModel<ReservationResponse> getReservation(
            @Parameter(description = "예약 ID") @PathVariable Long id) {
        
        log.info("예약 상세 정보 조회 요청: {}", id);
        
        ReservationResponse reservation = reservationService.getReservationById(id);
        
        log.info("예약 상세 정보 조회 완료: {}", reservation.getTitle());
        return ResultModelFactoryG2.getSuccessResultModel(reservation);
    }

    @PutMapping("/reservations/{id}")
    @Operation(
        summary = "예약 정보 수정", 
        description = "기존 예약 정보를 수정합니다."
    )
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResultModel<ReservationResponse> updateReservation(
            @Parameter(description = "예약 ID") @PathVariable Long id,
            @Valid @RequestBody ReservationUpdateRequest request) {
        
        log.info("예약 정보 수정 요청: {} - {}", id, request.getTitle());
        
        ReservationResponse updatedReservation = reservationService.updateReservation(id, request);
        
        log.info("예약 정보 수정 완료: {}", updatedReservation.getTitle());
        return ResultModelFactoryG2.getSuccessResultModel(updatedReservation);
    }

    @DeleteMapping("/reservations/{id}")
    @Operation(
        summary = "예약 취소", 
        description = "예약을 취소합니다. 시작 1시간 전까지만 취소 가능합니다."
    )
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResultModel<Void> cancelReservation(
            @Parameter(description = "예약 ID") @PathVariable Long id) {
        
        log.info("예약 취소 요청: {}", id);
        
        reservationService.cancelReservation(id);
        
        log.info("예약 취소 완료: {}", id);
        return ResultModelFactoryG2.getSuccessResultModel();
    }

    // ========== 실시간 조회 API ==========

    @GetMapping("/meeting-rooms/{id}/available-slots")
    @Operation(
        summary = "예약 가능 시간 조회", 
        description = "특정 회의실의 특정 날짜 예약 가능 시간을 조회합니다."
    )
    public ResultModel<List<AvailableTimeSlotResponse>> getAvailableTimeSlots(
            @Parameter(description = "회의실 ID") @PathVariable Long id,
            @Parameter(description = "조회 날짜 (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        
        log.info("예약 가능 시간 조회 요청: 회의실 {}, 날짜 {}", id, date);
        
        List<AvailableTimeSlotResponse> availableSlots = 
            reservationService.getAvailableTimeSlots(id, date);
        
        log.info("예약 가능 시간 조회 완료: {} 개 슬롯", availableSlots.size());
        return ResultModelFactoryG2.getSuccessResultModel(availableSlots);
    }

    @GetMapping("/reservations/today")
    @Operation(
        summary = "오늘 예약 현황 조회", 
        description = "오늘 날짜의 모든 예약 현황을 조회합니다."
    )
    public ResultModel<List<TodayReservationResponse>> getTodayReservations() {
        log.info("오늘 예약 현황 조회 요청");
        
        List<TodayReservationResponse> todayReservations = 
            reservationService.getTodayReservations();
        
        log.info("오늘 예약 현황 조회 완료: {} 건", todayReservations.size());
        return ResultModelFactoryG2.getSuccessResultModel(todayReservations);
    }

    // ========== 통계 API ==========

    @GetMapping("/meeting-rooms/statistics")
    @Operation(
        summary = "회의실 이용 통계", 
        description = "지정된 기간 동안의 회의실 이용 통계를 조회합니다."
    )
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResultModel<UsageStatisticsResponse> getUsageStatistics(
            @Parameter(description = "시작 날짜 (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @Parameter(description = "종료 날짜 (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        
        log.info("회의실 이용 통계 조회 요청: {} ~ {}", startDate, endDate);
        
        UsageStatisticsResponse statistics = 
            reservationService.getUsageStatistics(startDate, endDate);
        
        log.info("회의실 이용 통계 조회 완료: 총 {} 건 예약", statistics.getTotalReservations());
        return ResultModelFactoryG2.getSuccessResultModel(statistics);
    }

    @GetMapping("/meeting-rooms/{id}/utilization")
    @Operation(
        summary = "특정 회의실 이용률 조회", 
        description = "특정 회의실의 월별 이용률을 조회합니다."
    )
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResultModel<List<MonthlyUtilizationResponse>> getMeetingRoomUtilization(
            @Parameter(description = "회의실 ID") @PathVariable Long id,
            @Parameter(description = "조회 년도") @RequestParam int year) {
        
        log.info("회의실 이용률 조회 요청: 회의실 {}, 년도 {}", id, year);
        
        List<MonthlyUtilizationResponse> utilization = 
            reservationService.getMeetingRoomUtilization(id, year);
        
        log.info("회의실 이용률 조회 완료: {} 개월 데이터", utilization.size());
        return ResultModelFactoryG2.getSuccessResultModel(utilization);
    }

    // ========== 알림 및 상태 API ==========

    @PostMapping("/reservations/{id}/checkin")
    @Operation(
        summary = "예약 체크인", 
        description = "예약된 회의실에 체크인합니다."
    )
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResultModel<ReservationResponse> checkInReservation(
            @Parameter(description = "예약 ID") @PathVariable Long id) {
        
        log.info("예약 체크인 요청: {}", id);
        
        ReservationResponse reservation = reservationService.checkInReservation(id);
        
        log.info("예약 체크인 완료: {}", reservation.getTitle());
        return ResultModelFactoryG2.getSuccessResultModel(reservation);
    }

    @PostMapping("/reservations/{id}/extend")
    @Operation(
        summary = "예약 시간 연장", 
        description = "진행 중인 예약의 종료 시간을 연장합니다."
    )
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResultModel<ReservationResponse> extendReservation(
            @Parameter(description = "예약 ID") @PathVariable Long id,
            @Parameter(description = "연장할 분 수") @RequestParam int extensionMinutes) {
        
        log.info("예약 시간 연장 요청: {} - {} 분", id, extensionMinutes);
        
        ReservationResponse reservation = reservationService.extendReservation(id, extensionMinutes);
        
        log.info("예약 시간 연장 완료: {}", reservation.getTitle());
        return ResultModelFactoryG2.getSuccessResultModel(reservation);
    }

    @GetMapping("/reservations/conflicts")
    @Operation(
        summary = "예약 충돌 체크", 
        description = "지정된 시간대의 예약 충돌을 미리 체크합니다."
    )
    public ResultModel<ConflictCheckResponse> checkReservationConflict(
            @Parameter(description = "회의실 ID") @RequestParam Long meetingRoomId,
            @Parameter(description = "시작 시간") 
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime startTime,
            @Parameter(description = "종료 시간")
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime endTime,
            @Parameter(description = "제외할 예약 ID (수정 시)") @RequestParam(required = false) Long excludeReservationId) {
        
        log.info("예약 충돌 체크 요청: 회의실 {}, {} ~ {}", meetingRoomId, startTime, endTime);
        
        ConflictCheckResponse conflictCheck = reservationService.checkReservationConflict(
            meetingRoomId, startTime, endTime, excludeReservationId);
        
        log.info("예약 충돌 체크 완료: 충돌 여부 {}", conflictCheck.isHasConflict());
        return ResultModelFactoryG2.getSuccessResultModel(conflictCheck);
    }
}