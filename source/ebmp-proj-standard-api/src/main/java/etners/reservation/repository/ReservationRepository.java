package etners.reservation.repository;

import etners.reservation.dto.MeetingRoomUsageInfo;
import etners.reservation.dto.ReservationSearchRequest;
import etners.reservation.entity.Reservation;
import etners.reservation.entity.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 예약 Repository
 * 
 * AI Engine이 요청한 회의실 예약 서비스의 예약 데이터 접근 계층
 * BaseEntity의 공통 필드를 활용한 쿼리 메서드들을 포함
 * 
 * @author AI Engine Generated
 * @version 1.0.0
 */
@Repository
public interface ReservationRepository extends 
    JpaRepository<Reservation, Long>, 
    QuerydslPredicateExecutor<Reservation>,
    ReservationRepositoryCustom {

    // ========== 기본 조회 메서드 ==========

    /**
     * ID로 사용 가능한 예약 조회
     */
    Optional<Reservation> findByIdAndUseYnTrue(Long id);

    /**
     * 특정 회의실의 예약 목록 조회 (최신순)
     */
    List<Reservation> findByMeetingRoomIdAndUseYnTrueOrderByStartTimeDesc(Long meetingRoomId);

    /**
     * 특정 상태의 예약 목록 조회
     */
    List<Reservation> findByStatusAndUseYnTrueOrderByStartTime(ReservationStatus status);

    /**
     * 예약자별 예약 목록 조회
     */
    List<Reservation> findByRequesterEmailAndUseYnTrueOrderByStartTimeDesc(String requesterEmail);

    /**
     * 특정 날짜 범위의 예약 목록 조회
     */
    @Query("SELECT r FROM Reservation r WHERE r.startTime >= :startTime AND r.endTime <= :endTime AND r.useYn = true ORDER BY r.startTime")
    List<Reservation> findByDateRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    // ========== 중복 예약 체크 메서드 ==========

    /**
     * 특정 회의실의 특정 시간대 중복 예약 존재 여부 확인
     */
    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.meetingRoomId = :meetingRoomId " +
           "AND r.status NOT IN ('CANCELLED') " +
           "AND r.useYn = true " +
           "AND ((r.startTime < :endTime AND r.endTime > :startTime))")
    boolean existsOverlappingReservation(@Param("meetingRoomId") Long meetingRoomId, 
                                       @Param("startTime") LocalDateTime startTime, 
                                       @Param("endTime") LocalDateTime endTime);

    /**
     * 특정 예약을 제외한 중복 예약 존재 여부 확인 (수정 시 사용)
     */
    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.meetingRoomId = :meetingRoomId " +
           "AND r.id != :excludeId " +
           "AND r.status NOT IN ('CANCELLED') " +
           "AND r.useYn = true " +
           "AND ((r.startTime < :endTime AND r.endTime > :startTime))")
    boolean existsOverlappingReservationExcluding(@Param("meetingRoomId") Long meetingRoomId, 
                                                @Param("startTime") LocalDateTime startTime, 
                                                @Param("endTime") LocalDateTime endTime,
                                                @Param("excludeId") Long excludeId);

    /**
     * 중복되는 예약 목록 조회
     */
    @Query("SELECT r FROM Reservation r WHERE r.meetingRoomId = :meetingRoomId " +
           "AND r.status NOT IN ('CANCELLED') " +
           "AND r.useYn = true " +
           "AND ((r.startTime < :endTime AND r.endTime > :startTime)) " +
           "ORDER BY r.startTime")
    List<Reservation> findOverlappingReservations(@Param("meetingRoomId") Long meetingRoomId,
                                                 @Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);

    /**
     * 특정 예약을 제외한 중복되는 예약 목록 조회
     */
    @Query("SELECT r FROM Reservation r WHERE r.meetingRoomId = :meetingRoomId " +
           "AND r.id != :excludeId " +
           "AND r.status NOT IN ('CANCELLED') " +
           "AND r.useYn = true " +
           "AND ((r.startTime < :endTime AND r.endTime > :startTime)) " +
           "ORDER BY r.startTime")
    List<Reservation> findOverlappingReservationsExcluding(@Param("meetingRoomId") Long meetingRoomId,
                                                          @Param("startTime") LocalDateTime startTime,
                                                          @Param("endTime") LocalDateTime endTime,
                                                          @Param("excludeId") Long excludeId);

    // ========== 특정 조건 조회 메서드 ==========

    /**
     * 특정 회의실의 특정 날짜 예약 목록 조회
     */
    @Query("SELECT r FROM Reservation r WHERE r.meetingRoomId = :meetingRoomId " +
           "AND r.startTime >= :startTime AND r.startTime < :endTime " +
           "AND r.status NOT IN ('CANCELLED') " +
           "AND r.useYn = true ORDER BY r.startTime")
    List<Reservation> findByMeetingRoomIdAndDateRange(@Param("meetingRoomId") Long meetingRoomId,
                                                    @Param("startTime") LocalDateTime startTime,
                                                    @Param("endTime") LocalDateTime endTime);

    /**
     * 오늘의 예약 목록 조회 (모든 회의실)
     */
    @Query("SELECT r FROM Reservation r WHERE r.startTime >= :startOfDay AND r.startTime < :endOfDay " +
           "AND r.status NOT IN ('CANCELLED') " +
           "AND r.useYn = true ORDER BY r.startTime, r.meetingRoomId")
    List<Reservation> findTodayReservations(@Param("startOfDay") LocalDateTime startOfDay, 
                                          @Param("endOfDay") LocalDateTime endOfDay);

    /**
     * 현재 진행 중인 예약 목록 조회
     */
    @Query("SELECT r FROM Reservation r WHERE r.status = 'IN_PROGRESS' " +
           "AND r.useYn = true ORDER BY r.startTime")
    List<Reservation> findCurrentInProgressReservations();

    /**
     * 곧 시작될 예약 목록 조회 (30분 내)
     */
    @Query("SELECT r FROM Reservation r WHERE r.status = 'CONFIRMED' " +
           "AND r.startTime BETWEEN :now AND :futureTime " +
           "AND r.useYn = true ORDER BY r.startTime")
    List<Reservation> findUpcomingReservations(@Param("now") LocalDateTime now, 
                                             @Param("futureTime") LocalDateTime futureTime);

    /**
     * 노쇼 처리 대상 예약 목록 조회 (시작 시간 30분 후까지 체크인 안 함)
     */
    @Query("SELECT r FROM Reservation r WHERE r.status = 'CONFIRMED' " +
           "AND r.startTime < :cutoffTime " +
           "AND r.actualStartTime IS NULL " +
           "AND r.useYn = true")
    List<Reservation> findNoShowCandidates(@Param("cutoffTime") LocalDateTime cutoffTime);

    // ========== 통계 조회 메서드 ==========

    /**
     * 특정 기간 내 총 예약 건수 조회
     */
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.startTime >= :startTime AND r.endTime <= :endTime " +
           "AND r.status NOT IN ('CANCELLED') AND r.useYn = true")
    int countByDateRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 특정 회의실의 특정 기간 내 예약 건수 조회
     */
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.meetingRoomId = :meetingRoomId " +
           "AND r.startTime >= :startTime AND r.endTime <= :endTime " +
           "AND r.status NOT IN ('CANCELLED') AND r.useYn = true")
    int countByMeetingRoomIdAndDateRange(@Param("meetingRoomId") Long meetingRoomId,
                                       @Param("startTime") LocalDateTime startTime, 
                                       @Param("endTime") LocalDateTime endTime);

    /**
     * 특정 기간 내 총 예약 시간 계산 (시간 단위)
     */
    @Query("SELECT SUM(EXTRACT(HOUR FROM (r.endTime - r.startTime)) + " +
           "EXTRACT(MINUTE FROM (r.endTime - r.startTime)) / 60.0) " +
           "FROM Reservation r WHERE r.startTime >= :startTime AND r.endTime <= :endTime " +
           "AND r.status NOT IN ('CANCELLED') AND r.useYn = true")
    Double sumReservationHours(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 가장 많이 사용된 회의실 조회
     */
    @Query("SELECT new etners.reservation.dto.MeetingRoomUsageInfo(r.meetingRoomId, " +
           "COUNT(r), SUM(EXTRACT(HOUR FROM (r.endTime - r.startTime)) + " +
           "EXTRACT(MINUTE FROM (r.endTime - r.startTime)) / 60.0)) " +
           "FROM Reservation r WHERE r.startTime >= :startTime AND r.endTime <= :endTime " +
           "AND r.status NOT IN ('CANCELLED') AND r.useYn = true " +
           "GROUP BY r.meetingRoomId ORDER BY COUNT(r) DESC")
    List<MeetingRoomUsageInfo> findMeetingRoomUsageStats(@Param("startTime") LocalDateTime startTime, 
                                                        @Param("endTime") LocalDateTime endTime);

    /**
     * 가장 많이 사용된 회의실 (단일 결과)
     */
    @Query("SELECT new etners.reservation.dto.MeetingRoomUsageInfo(r.meetingRoomId, " +
           "COUNT(r), SUM(EXTRACT(HOUR FROM (r.endTime - r.startTime)) + " +
           "EXTRACT(MINUTE FROM (r.endTime - r.startTime)) / 60.0)) " +
           "FROM Reservation r WHERE r.startTime >= :startTime AND r.endTime <= :endTime " +
           "AND r.status NOT IN ('CANCELLED') AND r.useYn = true " +
           "GROUP BY r.meetingRoomId ORDER BY COUNT(r) DESC")
    MeetingRoomUsageInfo findMostUsedRoom(@Param("startTime") LocalDateTime startTime, 
                                        @Param("endTime") LocalDateTime endTime);

    /**
     * 월별 예약 통계
     */
    @Query("SELECT EXTRACT(YEAR FROM r.startTime), EXTRACT(MONTH FROM r.startTime), COUNT(r) " +
           "FROM Reservation r WHERE r.startTime >= :startTime AND r.endTime <= :endTime " +
           "AND r.status NOT IN ('CANCELLED') AND r.useYn = true " +
           "GROUP BY EXTRACT(YEAR FROM r.startTime), EXTRACT(MONTH FROM r.startTime) " +
           "ORDER BY EXTRACT(YEAR FROM r.startTime), EXTRACT(MONTH FROM r.startTime)")
    List<Object[]> getMonthlyReservationStats(@Param("startTime") LocalDateTime startTime, 
                                            @Param("endTime") LocalDateTime endTime);

    /**
     * 시간대별 예약 통계
     */
    @Query("SELECT EXTRACT(HOUR FROM r.startTime), COUNT(r) " +
           "FROM Reservation r WHERE r.startTime >= :startTime AND r.endTime <= :endTime " +
           "AND r.status NOT IN ('CANCELLED') AND r.useYn = true " +
           "GROUP BY EXTRACT(HOUR FROM r.startTime) " +
           "ORDER BY EXTRACT(HOUR FROM r.startTime)")
    List<Object[]> getHourlyReservationStats(@Param("startTime") LocalDateTime startTime, 
                                           @Param("endTime") LocalDateTime endTime);

    /**
     * 요일별 예약 통계
     */
    @Query("SELECT EXTRACT(DOW FROM r.startTime), COUNT(r) " +
           "FROM Reservation r WHERE r.startTime >= :startTime AND r.endTime <= :endTime " +
           "AND r.status NOT IN ('CANCELLED') AND r.useYn = true " +
           "GROUP BY EXTRACT(DOW FROM r.startTime) " +
           "ORDER BY EXTRACT(DOW FROM r.startTime)")
    List<Object[]> getDayOfWeekReservationStats(@Param("startTime") LocalDateTime startTime, 
                                              @Param("endTime") LocalDateTime endTime);

    // ========== 검색 메서드 ==========

    /**
     * 동적 조건 검색 (페이징)
     */
    Page<Reservation> findBySearchConditions(ReservationSearchRequest searchRequest, Pageable pageable);

    /**
     * 예약자 이메일로 검색
     */
    @Query("SELECT r FROM Reservation r WHERE r.requesterEmail LIKE %:email% AND r.useYn = true ORDER BY r.startTime DESC")
    List<Reservation> findByRequesterEmailContaining(@Param("email") String email);

    /**
     * 제목으로 검색
     */
    @Query("SELECT r FROM Reservation r WHERE r.title LIKE %:title% AND r.useYn = true ORDER BY r.startTime DESC")
    List<Reservation> findByTitleContaining(@Param("title") String title);

    /**
     * 부서별 예약 목록 조회
     */
    List<Reservation> findByDepartmentAndUseYnTrueOrderByStartTimeDesc(String department);
}