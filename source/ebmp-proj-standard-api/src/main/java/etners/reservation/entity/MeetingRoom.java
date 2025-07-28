package etners.reservation.entity;

import common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.List;

/**
 * 회의실 Entity
 * 
 * AI Engine이 요청한 회의실 예약 서비스의 회의실 도메인 모델
 * BaseEntity를 상속받아 공통 필드 (생성일시, 수정일시, 사용여부 등)를 포함
 * 
 * @author AI Engine Generated
 * @version 1.0.0
 */
@Entity
@Table(name = "meeting_rooms")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class MeetingRoom extends BaseEntity {

    /**
     * 회의실 고유 ID
     */
    @Id
    @GeneratedValue(generator = "common-id")
    @GenericGenerator(name = "common-id", strategy = "common.util.generator.CommonIdGenerator")
    @Column(name = "meeting_room_id")
    private Long id;

    /**
     * 회의실 이름
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * 회의실 위치
     */
    @Column(name = "location", nullable = false, length = 100)
    private String location;

    /**
     * 수용 인원
     */
    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    /**
     * 회의실 설명
     */
    @Column(name = "description", length = 500)
    private String description;

    /**
     * 보유 시설 목록 (JSON 형태로 저장)
     */
    @ElementCollection
    @CollectionTable(
        name = "meeting_room_facilities",
        joinColumns = @JoinColumn(name = "meeting_room_id")
    )
    @Column(name = "facility")
    private List<String> facilities;

    /**
     * 회의실 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private MeetingRoomStatus status = MeetingRoomStatus.AVAILABLE;

    /**
     * 시간당 이용료 (원)
     */
    @Column(name = "hourly_rate")
    private Integer hourlyRate;

    /**
     * 예약 가능 여부
     */
    @Column(name = "bookable", nullable = false)
    @Builder.Default
    private Boolean bookable = true;

    // ========== 비즈니스 메서드 ==========

    /**
     * 회의실이 예약 가능한 상태인지 확인
     */
    public boolean isBookable() {
        return this.bookable && 
               this.status == MeetingRoomStatus.AVAILABLE && 
               this.useYn;
    }

    /**
     * 회의실 상태 변경
     */
    public void updateStatus(MeetingRoomStatus newStatus) {
        this.status = newStatus;
    }

    /**
     * 회의실 기본 정보 업데이트
     */
    public void updateBasicInfo(String name, String location, Integer capacity, String description) {
        if (name != null && !name.trim().isEmpty()) {
            this.name = name;
        }
        if (location != null && !location.trim().isEmpty()) {
            this.location = location;
        }
        if (capacity != null && capacity > 0) {
            this.capacity = capacity;
        }
        if (description != null) {
            this.description = description;
        }
    }

    /**
     * 시설 목록 업데이트
     */
    public void updateFacilities(List<String> facilities) {
        this.facilities = facilities;
    }

    /**
     * 예약 가능 여부 토글
     */
    public void toggleBookable() {
        this.bookable = !this.bookable;
    }

    /**
     * 시간당 이용료 설정
     */
    public void setHourlyRate(Integer rate) {
        if (rate != null && rate >= 0) {
            this.hourlyRate = rate;
        }
    }

    /**
     * 회의실 정보를 문자열로 표현
     */
    @Override
    public String toString() {
        return String.format("MeetingRoom{id=%d, name='%s', location='%s', capacity=%d, status=%s}", 
                           id, name, location, capacity, status);
    }
}