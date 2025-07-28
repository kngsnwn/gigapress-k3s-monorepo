package etners.reservation.repository;

import etners.reservation.dto.MeetingRoomSearchCondition;
import etners.reservation.entity.MeetingRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 회의실 Repository Custom Interface
 * 
 * QueryDSL을 사용한 복잡한 동적 쿼리를 위한 커스텀 인터페이스
 * 
 * @author AI Engine Generated
 * @version 1.0.0
 */
public interface MeetingRoomRepositoryCustom {

    /**
     * 복합 조건으로 회의실 검색
     */
    List<MeetingRoom> findByComplexConditions(MeetingRoomSearchCondition condition);

    /**
     * 복합 조건으로 회의실 검색 (페이징)
     */
    Page<MeetingRoom> findPageByConditions(MeetingRoomSearchCondition condition, Pageable pageable);

    /**
     * 특정 시간대에 예약 가능한 회의실 목록 조회
     */
    List<MeetingRoom> findAvailableInTimeRange(LocalDateTime startTime, LocalDateTime endTime, Integer minCapacity);

    /**
     * 위치별 회의실 이용률 통계
     */
    List<Object[]> getUtilizationStatsByLocation(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 인기 회의실 순위 (예약 횟수 기준)
     */
    List<Object[]> getPopularMeetingRooms(LocalDateTime startDate, LocalDateTime endDate, int limit);

    /**
     * 회의실별 평균 이용 시간
     */
    List<Object[]> getAverageUsageTimeByMeetingRoom(LocalDateTime startDate, LocalDateTime endDate);
}