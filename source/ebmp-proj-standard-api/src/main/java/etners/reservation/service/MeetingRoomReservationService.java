package etners.reservation.service;

import etners.reservation.dto.*;
import etners.reservation.entity.MeetingRoom;
import etners.reservation.entity.Reservation;
import etners.reservation.entity.ReservationStatus;
import etners.reservation.repository.MeetingRoomRepository;
import etners.reservation.repository.ReservationRepository;
import etners.reservation.mapper.ReservationMapper;
import etners.reservation.event.ReservationCreatedEvent;
import etners.reservation.event.ReservationUpdatedEvent;
import etners.reservation.event.ReservationCancelledEvent;
import etners.reservation.exception.ReservationNotFoundException;
import etners.reservation.exception.MeetingRoomNotFoundException;
import etners.reservation.exception.OverlappingReservationException;
import etners.reservation.exception.ReservationCancellationNotAllowedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 회의실 예약 관리 Service
 * 
 * AI Engine → Domain Schema → Backend Service 플로우에서 생성된
 * 회의실 예약 서비스의 비즈니스 로직 처리
 * 
 * 주요 기능:
 * - 회의실 관리 (조회, 등록)
 * - 예약 관리 (생성, 수정, 취소, 조회)
 * - 실시간 가용성 체크
 * - 이용 통계 및 분석
 * - 이벤트 발행
 * 
 * @author AI Engine Generated
 * @version 1.0.0
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class MeetingRoomReservationService {

    private final MeetingRoomRepository meetingRoomRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;
    private final ApplicationEventPublisher eventPublisher;

    // ========== 회의실 관리 ==========

    /**
     * 모든 사용 가능한 회의실 목록 조회
     */
    public List<MeetingRoomResponse> getAllMeetingRooms() {
        log.debug("모든 회의실 목록 조회 시작");
        
        List<MeetingRoom> meetingRooms = meetingRoomRepository.findAllByUseYnTrueOrderByName();
        
        List<MeetingRoomResponse> responses = meetingRooms.stream()
            .map(reservationMapper::toMeetingRoomResponse)
            .collect(Collectors.toList());
            
        log.debug("회의실 목록 조회 완료: {} 개", responses.size());
        return responses;
    }

    /**
     * 특정 회의실 상세 정보 조회
     */
    public MeetingRoomResponse getMeetingRoomById(Long id) {
        log.debug("회의실 상세 정보 조회 시작: {}", id);
        
        MeetingRoom meetingRoom = meetingRoomRepository.findByIdAndUseYnTrue(id)
            .orElseThrow(() -> new MeetingRoomNotFoundException("회의실을 찾을 수 없습니다: " + id));
            
        MeetingRoomResponse response = reservationMapper.toMeetingRoomResponse(meetingRoom);
        
        log.debug("회의실 상세 정보 조회 완료: {}", response.getName());
        return response;
    }

    /**
     * 새로운 회의실 등록
     */
    @Transactional
    public MeetingRoomResponse createMeetingRoom(MeetingRoomCreateRequest request) {
        log.info("회의실 등록 시작: {}", request.getName());
        
        // 중복 이름 체크
        if (meetingRoomRepository.existsByNameAndUseYnTrue(request.getName())) {
            throw new IllegalArgumentException("이미 존재하는 회의실 이름입니다: " + request.getName());
        }
        
        MeetingRoom meetingRoom = MeetingRoom.builder()
            .name(request.getName())
            .location(request.getLocation())
            .capacity(request.getCapacity())
            .facilities(request.getFacilities())
            .description(request.getDescription())
            .build();
            
        MeetingRoom savedMeetingRoom = meetingRoomRepository.save(meetingRoom);
        MeetingRoomResponse response = reservationMapper.toMeetingRoomResponse(savedMeetingRoom);
        
        log.info("회의실 등록 완료: {} (ID: {})", response.getName(), response.getId());
        return response;
    }

    // ========== 예약 관리 ==========

    /**
     * 새로운 예약 생성
     */
    @Transactional
    public ReservationResponse createReservation(ReservationCreateRequest request) {
        log.info("예약 생성 시작: {} - 회의실 {}", request.getTitle(), request.getMeetingRoomId());
        
        // 회의실 존재 확인
        MeetingRoom meetingRoom = meetingRoomRepository.findByIdAndUseYnTrue(request.getMeetingRoomId())
            .orElseThrow(() -> new MeetingRoomNotFoundException("회의실을 찾을 수 없습니다: " + request.getMeetingRoomId()));
        
        // 예약 시간 유효성 검증
        validateReservationTime(request.getStartTime(), request.getEndTime());
        
        // 중복 예약 체크
        if (reservationRepository.existsOverlappingReservation(
                request.getMeetingRoomId(), request.getStartTime(), request.getEndTime())) {
            throw new OverlappingReservationException("해당 시간대에 이미 예약이 있습니다.");
        }
        
        // 예약 생성
        Reservation reservation = Reservation.builder()
            .meetingRoomId(request.getMeetingRoomId())
            .title(request.getTitle())
            .description(request.getDescription())
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .attendeeCount(request.getAttendeeCount())
            .requesterName(request.getRequesterName())
            .requesterEmail(request.getRequesterEmail())
            .status(ReservationStatus.CONFIRMED)
            .build();
            
        Reservation savedReservation = reservationRepository.save(reservation);
        ReservationResponse response = reservationMapper.toReservationResponse(savedReservation);
        
        // 예약 생성 이벤트 발행
        eventPublisher.publishEvent(ReservationCreatedEvent.from(savedReservation, meetingRoom));
        
        log.info("예약 생성 완료: {} (ID: {})", response.getTitle(), response.getId());
        return response;
    }

    /**
     * 예약 목록 조회 (페이징)
     */
    public Page<ReservationResponse> getReservations(ReservationSearchRequest searchRequest, Pageable pageable) {
        log.debug("예약 목록 조회 시작: {}", searchRequest);
        
        Page<Reservation> reservations = reservationRepository.findBySearchConditions(searchRequest, pageable);
        
        Page<ReservationResponse> responses = reservations.map(reservationMapper::toReservationResponse);
        
        log.debug("예약 목록 조회 완료: {}건 (총 {}건)", responses.getNumberOfElements(), responses.getTotalElements());
        return responses;
    }

    /**
     * 특정 예약 상세 정보 조회
     */
    public ReservationResponse getReservationById(Long id) {
        log.debug("예약 상세 정보 조회 시작: {}", id);
        
        Reservation reservation = reservationRepository.findByIdAndUseYnTrue(id)
            .orElseThrow(() -> new ReservationNotFoundException("예약을 찾을 수 없습니다: " + id));
            
        ReservationResponse response = reservationMapper.toReservationResponse(reservation);
        
        log.debug("예약 상세 정보 조회 완료: {}", response.getTitle());
        return response;
    }

    /**
     * 예약 정보 수정
     */
    @Transactional
    public ReservationResponse updateReservation(Long id, ReservationUpdateRequest request) {
        log.info("예약 정보 수정 시작: {}", id);
        
        Reservation reservation = reservationRepository.findByIdAndUseYnTrue(id)
            .orElseThrow(() -> new ReservationNotFoundException("예약을 찾을 수 없습니다: " + id));
        
        // 예약 상태 확인 (취소된 예약은 수정 불가)
        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalStateException("취소된 예약은 수정할 수 없습니다.");
        }
        
        // 시간 변경 시 중복 체크
        if (request.getStartTime() != null && request.getEndTime() != null) {
            validateReservationTime(request.getStartTime(), request.getEndTime());
            
            if (reservationRepository.existsOverlappingReservationExcluding(
                    reservation.getMeetingRoomId(), request.getStartTime(), request.getEndTime(), id)) {
                throw new OverlappingReservationException("해당 시간대에 이미 예약이 있습니다.");
            }
        }
        
        // 예약 정보 업데이트
        if (request.getTitle() != null) {
            reservation.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            reservation.setDescription(request.getDescription());
        }
        if (request.getStartTime() != null) {
            reservation.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            reservation.setEndTime(request.getEndTime());
        }
        if (request.getAttendeeCount() != null) {
            reservation.setAttendeeCount(request.getAttendeeCount());
        }
        
        ReservationResponse response = reservationMapper.toReservationResponse(reservation);
        
        // 예약 수정 이벤트 발행
        eventPublisher.publishEvent(ReservationUpdatedEvent.from(reservation));
        
        log.info("예약 정보 수정 완료: {}", response.getTitle());
        return response;
    }

    /**
     * 예약 취소
     */
    @Transactional
    public void cancelReservation(Long id) {
        log.info("예약 취소 시작: {}", id);
        
        Reservation reservation = reservationRepository.findByIdAndUseYnTrue(id)
            .orElseThrow(() -> new ReservationNotFoundException("예약을 찾을 수 없습니다: " + id));
        
        // 취소 가능 시간 체크 (시작 1시간 전까지)
        LocalDateTime cancellationDeadline = reservation.getStartTime().minusHours(1);
        if (LocalDateTime.now().isAfter(cancellationDeadline)) {
            throw new ReservationCancellationNotAllowedException(
                "예약 시작 1시간 전까지만 취소 가능합니다.");
        }
        
        // 예약 상태를 취소로 변경
        reservation.setStatus(ReservationStatus.CANCELLED);
        
        // 예약 취소 이벤트 발행
        eventPublisher.publishEvent(ReservationCancelledEvent.from(reservation));
        
        log.info("예약 취소 완료: {}", reservation.getTitle());
    }

    // ========== 실시간 조회 ==========

    /**
     * 특정 회의실의 특정 날짜 예약 가능 시간 조회
     */
    public List<AvailableTimeSlotResponse> getAvailableTimeSlots(Long meetingRoomId, LocalDate date) {
        log.debug("예약 가능 시간 조회 시작: 회의실 {}, 날짜 {}", meetingRoomId, date);
        
        // 회의실 존재 확인
        meetingRoomRepository.findByIdAndUseYnTrue(meetingRoomId)
            .orElseThrow(() -> new MeetingRoomNotFoundException("회의실을 찾을 수 없습니다: " + meetingRoomId));
        
        // 해당 날짜의 예약 목록 조회
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        
        List<Reservation> reservations = reservationRepository.findByMeetingRoomIdAndDateRange(
            meetingRoomId, startOfDay, endOfDay);
        
        // 예약 가능 시간 슬롯 생성 (9:00 ~ 18:00, 1시간 단위)
        List<AvailableTimeSlotResponse> availableSlots = new ArrayList<>();
        
        for (int hour = 9; hour < 18; hour++) {
            LocalDateTime slotStart = date.atTime(hour, 0);
            LocalDateTime slotEnd = slotStart.plusHours(1);
            
            boolean isAvailable = reservations.stream()
                .noneMatch(reservation -> isTimeOverlapping(
                    slotStart, slotEnd, reservation.getStartTime(), reservation.getEndTime()));
            
            availableSlots.add(AvailableTimeSlotResponse.builder()
                .startTime(slotStart)
                .endTime(slotEnd)
                .available(isAvailable)
                .build());
        }
        
        log.debug("예약 가능 시간 조회 완료: {} 개 슬롯", availableSlots.size());
        return availableSlots;
    }

    /**
     * 오늘 예약 현황 조회
     */
    public List<TodayReservationResponse> getTodayReservations() {
        log.debug("오늘 예약 현황 조회 시작");
        
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        
        List<Reservation> todayReservations = reservationRepository.findTodayReservations(startOfDay, endOfDay);
        
        List<TodayReservationResponse> responses = todayReservations.stream()
            .map(reservation -> {
                MeetingRoom meetingRoom = meetingRoomRepository.findByIdAndUseYnTrue(reservation.getMeetingRoomId())
                    .orElse(null);
                return reservationMapper.toTodayReservationResponse(reservation, meetingRoom);
            })
            .collect(Collectors.toList());
        
        log.debug("오늘 예약 현황 조회 완료: {} 건", responses.size());
        return responses;
    }

    // ========== 통계 ==========

    /**
     * 회의실 이용 통계 조회
     */
    public UsageStatisticsResponse getUsageStatistics(LocalDate startDate, LocalDate endDate) {
        log.debug("회의실 이용 통계 조회 시작: {} ~ {}", startDate, endDate);
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        
        // 기본 통계 조회
        int totalReservations = reservationRepository.countByDateRange(startDateTime, endDateTime);
        double totalHours = reservationRepository.sumReservationHours(startDateTime, endDateTime);
        
        // 가장 많이 사용된 회의실 조회
        MeetingRoomUsageInfo mostUsedRoom = reservationRepository.findMostUsedRoom(startDateTime, endDateTime);
        
        // 평균 이용률 계산 (임의로 계산 - 실제로는 더 복잡한 로직 필요)
        double averageUtilization = totalHours > 0 ? (totalHours / (totalReservations * 2.0)) * 100 : 0;
        
        UsageStatisticsResponse response = UsageStatisticsResponse.builder()
            .totalReservations(totalReservations)
            .totalHours(totalHours)
            .averageUtilization(averageUtilization)
            .mostUsedRoom(mostUsedRoom)
            .build();
        
        log.debug("회의실 이용 통계 조회 완료: 총 {} 건 예약", totalReservations);
        return response;
    }

    /**
     * 특정 회의실 월별 이용률 조회
     */
    public List<MonthlyUtilizationResponse> getMeetingRoomUtilization(Long meetingRoomId, int year) {
        log.debug("회의실 월별 이용률 조회 시작: 회의실 {}, 년도 {}", meetingRoomId, year);
        
        List<MonthlyUtilizationResponse> monthlyUtilization = new ArrayList<>();
        
        for (int month = 1; month <= 12; month++) {
            LocalDate startOfMonth = LocalDate.of(year, month, 1);
            LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
            
            int reservationCount = reservationRepository.countByMeetingRoomIdAndDateRange(
                meetingRoomId, startOfMonth.atStartOfDay(), endOfMonth.atTime(LocalTime.MAX));
            
            double utilizationRate = calculateUtilizationRate(reservationCount, startOfMonth.lengthOfMonth());
            
            monthlyUtilization.add(MonthlyUtilizationResponse.builder()
                .year(year)
                .month(month)
                .reservationCount(reservationCount)
                .utilizationRate(utilizationRate)
                .build());
        }
        
        log.debug("회의실 월별 이용률 조회 완료: {} 개월 데이터", monthlyUtilization.size());
        return monthlyUtilization;
    }

    // ========== 추가 기능 ==========

    /**
     * 예약 체크인
     */
    @Transactional
    public ReservationResponse checkInReservation(Long id) {
        log.info("예약 체크인 시작: {}", id);
        
        Reservation reservation = reservationRepository.findByIdAndUseYnTrue(id)
            .orElseThrow(() -> new ReservationNotFoundException("예약을 찾을 수 없습니다: " + id));
        
        // 체크인 가능 시간 확인 (시작 시간 30분 전부터 가능)
        LocalDateTime checkInAllowedTime = reservation.getStartTime().minusMinutes(30);
        LocalDateTime now = LocalDateTime.now();
        
        if (now.isBefore(checkInAllowedTime) || now.isAfter(reservation.getEndTime())) {
            throw new IllegalStateException("체크인 가능 시간이 아닙니다.");
        }
        
        reservation.setStatus(ReservationStatus.IN_PROGRESS);
        reservation.setActualStartTime(now);
        
        ReservationResponse response = reservationMapper.toReservationResponse(reservation);
        
        log.info("예약 체크인 완료: {}", reservation.getTitle());
        return response;
    }

    /**
     * 예약 시간 연장
     */
    @Transactional
    public ReservationResponse extendReservation(Long id, int extensionMinutes) {
        log.info("예약 시간 연장 시작: {} - {} 분", id, extensionMinutes);
        
        Reservation reservation = reservationRepository.findByIdAndUseYnTrue(id)
            .orElseThrow(() -> new ReservationNotFoundException("예약을 찾을 수 없습니다: " + id));
        
        if (reservation.getStatus() != ReservationStatus.IN_PROGRESS) {
            throw new IllegalStateException("진행 중인 예약만 연장 가능합니다.");
        }
        
        LocalDateTime newEndTime = reservation.getEndTime().plusMinutes(extensionMinutes);
        
        // 연장 시간에 다른 예약이 있는지 확인
        if (reservationRepository.existsOverlappingReservationExcluding(
                reservation.getMeetingRoomId(), reservation.getEndTime(), newEndTime, id)) {
            throw new OverlappingReservationException("연장 시간에 다른 예약이 있습니다.");
        }
        
        reservation.setEndTime(newEndTime);
        
        ReservationResponse response = reservationMapper.toReservationResponse(reservation);
        
        log.info("예약 시간 연장 완료: {} - 새 종료시간: {}", reservation.getTitle(), newEndTime);
        return response;
    }

    /**
     * 예약 충돌 체크
     */
    public ConflictCheckResponse checkReservationConflict(
            Long meetingRoomId, LocalDateTime startTime, LocalDateTime endTime, Long excludeReservationId) {
        
        log.debug("예약 충돌 체크 시작: 회의실 {}, {} ~ {}", meetingRoomId, startTime, endTime);
        
        boolean hasConflict;
        List<Reservation> conflictingReservations;
        
        if (excludeReservationId != null) {
            hasConflict = reservationRepository.existsOverlappingReservationExcluding(
                meetingRoomId, startTime, endTime, excludeReservationId);
            conflictingReservations = reservationRepository.findOverlappingReservationsExcluding(
                meetingRoomId, startTime, endTime, excludeReservationId);
        } else {
            hasConflict = reservationRepository.existsOverlappingReservation(
                meetingRoomId, startTime, endTime);
            conflictingReservations = reservationRepository.findOverlappingReservations(
                meetingRoomId, startTime, endTime);
        }
        
        List<ConflictingReservationInfo> conflictingReservationInfos = conflictingReservations.stream()
            .map(reservationMapper::toConflictingReservationInfo)
            .collect(Collectors.toList());
        
        ConflictCheckResponse response = ConflictCheckResponse.builder()
            .hasConflict(hasConflict)
            .conflictingReservations(conflictingReservationInfos)
            .build();
        
        log.debug("예약 충돌 체크 완료: 충돌 여부 {}", hasConflict);
        return response;
    }

    // ========== Private Helper Methods ==========

    /**
     * 예약 시간 유효성 검증
     */
    private void validateReservationTime(LocalDateTime startTime, LocalDateTime endTime) {
        LocalDateTime now = LocalDateTime.now();
        
        // 과거 시간 예약 불가
        if (startTime.isBefore(now)) {
            throw new IllegalArgumentException("과거 시간으로는 예약할 수 없습니다.");
        }
        
        // 종료 시간이 시작 시간보다 늦어야 함
        if (endTime.isBefore(startTime) || endTime.isEqual(startTime)) {
            throw new IllegalArgumentException("종료 시간은 시작 시간보다 늦어야 합니다.");
        }
        
        // 최대 7일 후까지만 예약 가능
        LocalDateTime maxReservationTime = now.plusDays(7);
        if (startTime.isAfter(maxReservationTime)) {
            throw new IllegalArgumentException("최대 7일 후까지만 예약 가능합니다.");
        }
        
        // 예약 시간은 최소 30분 이상
        if (startTime.plusMinutes(30).isAfter(endTime)) {
            throw new IllegalArgumentException("예약 시간은 최소 30분 이상이어야 합니다.");
        }
    }

    /**
     * 시간 겹침 체크
     */
    private boolean isTimeOverlapping(LocalDateTime start1, LocalDateTime end1, 
                                    LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    /**
     * 이용률 계산
     */
    private double calculateUtilizationRate(int reservationCount, int daysInMonth) {
        // 간단한 이용률 계산 (실제로는 더 복잡한 로직 필요)
        // 하루 최대 9시간 (9:00~18:00) 기준
        int maxPossibleReservations = daysInMonth * 9;
        return maxPossibleReservations > 0 ? ((double) reservationCount / maxPossibleReservations) * 100 : 0;
    }
}