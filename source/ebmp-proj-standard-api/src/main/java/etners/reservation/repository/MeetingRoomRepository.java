package etners.reservation.repository;

import etners.reservation.entity.MeetingRoom;
import etners.reservation.entity.MeetingRoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 회의실 Repository
 * 
 * AI Engine이 요청한 회의실 예약 서비스의 회의실 데이터 접근 계층
 * BaseEntity의 공통 필드를 활용한 쿼리 메서드들을 포함
 * 
 * @author AI Engine Generated
 * @version 1.0.0
 */
@Repository
public interface MeetingRoomRepository extends 
    JpaRepository<MeetingRoom, Long>, 
    QuerydslPredicateExecutor<MeetingRoom>,
    MeetingRoomRepositoryCustom {

    // ========== 기본 조회 메서드 ==========

    /**
     * 사용 가능한 모든 회의실 조회 (이름순 정렬)
     */
    List<MeetingRoom> findAllByUseYnTrueOrderByName();

    /**
     * ID로 사용 가능한 회의실 조회
     */
    Optional<MeetingRoom> findByIdAndUseYnTrue(Long id);

    /**
     * 이름으로 사용 가능한 회의실 조회
     */
    Optional<MeetingRoom> findByNameAndUseYnTrue(String name);

    /**
     * 특정 상태의 회의실 목록 조회
     */
    List<MeetingRoom> findByStatusAndUseYnTrueOrderByName(MeetingRoomStatus status);

    /**
     * 예약 가능한 회의실 목록 조회
     */
    List<MeetingRoom> findByBookableTrueAndUseYnTrueOrderByName();

    /**
     * 위치별 회의실 목록 조회
     */
    List<MeetingRoom> findByLocationAndUseYnTrueOrderByName(String location);

    /**
     * 수용 인원 이상의 회의실 목록 조회
     */
    List<MeetingRoom> findByCapacityGreaterThanEqualAndUseYnTrueOrderByCapacity(Integer capacity);

    // ========== 존재성 확인 메서드 ==========

    /**
     * 동일한 이름의 회의실 존재 여부 확인
     */
    boolean existsByNameAndUseYnTrue(String name);

    /**
     * 특정 위치에 회의실 존재 여부 확인
     */
    boolean existsByLocationAndUseYnTrue(String location);

    // ========== 커스텀 쿼리 메서드 ==========

    /**
     * 이름으로 회의실 검색 (부분 일치)
     */
    @Query("SELECT m FROM MeetingRoom m WHERE m.name LIKE %:name% AND m.useYn = true ORDER BY m.name")
    List<MeetingRoom> findByNameContainingAndUseYnTrue(@Param("name") String name);

    /**
     * 위치와 수용 인원 조건으로 회의실 검색
     */
    @Query("SELECT m FROM MeetingRoom m WHERE m.location = :location AND m.capacity >= :minCapacity AND m.useYn = true ORDER BY m.capacity")
    List<MeetingRoom> findByLocationAndMinCapacity(@Param("location") String location, @Param("minCapacity") Integer minCapacity);

    /**
     * 특정 시설을 보유한 회의실 검색
     */
    @Query("SELECT DISTINCT m FROM MeetingRoom m JOIN m.facilities f WHERE f = :facility AND m.useYn = true ORDER BY m.name")
    List<MeetingRoom> findByFacility(@Param("facility") String facility);

    /**
     * 여러 시설을 모두 보유한 회의실 검색
     */
    @Query("SELECT m FROM MeetingRoom m WHERE m.useYn = true AND " +
           "SIZE(m.facilities) >= :facilityCount AND " +
           "(SELECT COUNT(f) FROM MeetingRoom m2 JOIN m2.facilities f WHERE m2.id = m.id AND f IN :facilities) = :facilityCount " +
           "ORDER BY m.name")
    List<MeetingRoom> findByAllFacilities(@Param("facilities") List<String> facilities, @Param("facilityCount") long facilityCount);

    /**
     * 가격 범위로 회의실 검색
     */
    @Query("SELECT m FROM MeetingRoom m WHERE m.hourlyRate BETWEEN :minRate AND :maxRate AND m.useYn = true ORDER BY m.hourlyRate")
    List<MeetingRoom> findByHourlyRateRange(@Param("minRate") Integer minRate, @Param("maxRate") Integer maxRate);

    /**
     * 예약 가능하고 특정 수용 인원 이상인 회의실 검색
     */
    @Query("SELECT m FROM MeetingRoom m WHERE m.bookable = true AND m.status = 'AVAILABLE' AND m.capacity >= :minCapacity AND m.useYn = true ORDER BY m.capacity")
    List<MeetingRoom> findAvailableByMinCapacity(@Param("minCapacity") Integer minCapacity);

    /**
     * 회의실 통계 - 전체 수용 인원
     */
    @Query("SELECT SUM(m.capacity) FROM MeetingRoom m WHERE m.useYn = true")
    Integer getTotalCapacity();

    /**
     * 회의실 통계 - 위치별 개수
     */
    @Query("SELECT m.location, COUNT(m) FROM MeetingRoom m WHERE m.useYn = true GROUP BY m.location ORDER BY m.location")
    List<Object[]> countByLocation();

    /**
     * 회의실 통계 - 상태별 개수
     */
    @Query("SELECT m.status, COUNT(m) FROM MeetingRoom m WHERE m.useYn = true GROUP BY m.status ORDER BY m.status")
    List<Object[]> countByStatus();

    /**
     * 평균 수용 인원 조회
     */
    @Query("SELECT AVG(m.capacity) FROM MeetingRoom m WHERE m.useYn = true")
    Double getAverageCapacity();

    /**
     * 가장 많이 사용되는 시설 목록
     */
    @Query("SELECT f, COUNT(f) as cnt FROM MeetingRoom m JOIN m.facilities f WHERE m.useYn = true GROUP BY f ORDER BY cnt DESC")
    List<Object[]> getMostUsedFacilities();

    // ========== 업데이트 메서드 ==========

    /**
     * 회의실 상태 일괄 업데이트
     */
    @Query("UPDATE MeetingRoom m SET m.status = :newStatus WHERE m.location = :location AND m.useYn = true")
    int updateStatusByLocation(@Param("location") String location, @Param("newStatus") MeetingRoomStatus newStatus);

    /**
     * 특정 회의실의 예약 가능 여부 토글
     */
    @Query("UPDATE MeetingRoom m SET m.bookable = :bookable WHERE m.id = :id AND m.useYn = true")
    int updateBookableStatus(@Param("id") Long id, @Param("bookable") Boolean bookable);
}