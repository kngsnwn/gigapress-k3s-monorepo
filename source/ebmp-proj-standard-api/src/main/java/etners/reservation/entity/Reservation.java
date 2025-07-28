package etners.reservation.entity;

import common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

/**
 * 예약 Entity
 * 
 * AI Engine이 요청한 회의실 예약 서비스의 예약 도메인 모델
 * BaseEntity를 상속받아 공통 필드 (생성일시, 수정일시, 사용여부 등)를 포함
 * 
 * @author AI Engine Generated
 * @version 1.0.0
 */
@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Reservation extends BaseEntity {

    /**
     * 예약 고유 ID
     */
    @Id
    @GeneratedValue(generator = "common-id")
    @GenericGenerator(name = "common-id", strategy = "common.util.generator.CommonIdGenerator")
    @Column(name = "reservation_id")
    private Long id;

    /**
     * 회의실 ID (FK)
     */
    @Column(name = "meeting_room_id", nullable = false)
    private Long meetingRoomId;

    /**
     * 예약 제목
     */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    /**
     * 예약 설명
     */
    @Column(name = "description", length = 1000)
    private String description;

    /**
     * 예약 시작 시간
     */
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /**
     * 예약 종료 시간
     */
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    /**
     * 실제 시작 시간 (체크인 시간)
     */
    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    /**
     * 실제 종료 시간 (체크아웃 시간)
     */
    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    /**
     * 예약 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.PENDING;

    /**
     * 참석 예정 인원
     */
    @Column(name = "attendee_count", nullable = false)
    private Integer attendeeCount;

    /**
     * 예약자 이름
     */
    @Column(name = "requester_name", nullable = false, length = 100)
    private String requesterName;

    /**
     * 예약자 이메일
     */
    @Column(name = "requester_email", nullable = false, length = 200)
    private String requesterEmail;

    /**
     * 예약자 전화번호
     */
    @Column(name = "requester_phone", length = 20)
    private String requesterPhone;

    /**
     * 부서/조직
     */
    @Column(name = "department", length = 100)
    private String department;

    /**
     * 회의 목적
     */
    @Column(name = "purpose", length = 100)
    private String purpose;

    /**
     * 특별 요청 사항
     */
    @Column(name = "special_requests", length = 500)
    private String specialRequests;

    /**
     * 반복 예약 여부
     */
    @Column(name = "is_recurring")
    @Builder.Default
    private Boolean isRecurring = false;

    /**
     * 반복 패턴 (JSON 형태)
     */
    @Column(name = "recurring_pattern", length = 500)
    private String recurringPattern;

    /**
     * 취소 사유
     */
    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    /**
     * 취소 시간
     */
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    // ========== 비즈니스 메서드 ==========

    /**
     * 예약 상태 변경
     */
    public void updateStatus(ReservationStatus newStatus) {
        this.status = newStatus;
        
        if (newStatus == ReservationStatus.CANCELLED) {
            this.cancelledAt = LocalDateTime.now();
        }
    }

    /**
     * 예약 취소
     */
    public void cancel(String reason) {
        this.status = ReservationStatus.CANCELLED;
        this.cancellationReason = reason;
        this.cancelledAt = LocalDateTime.now();
    }

    /**
     * 체크인 처리
     */
    public void checkIn() {
        if (this.status != ReservationStatus.CONFIRMED) {
            throw new IllegalStateException("확정된 예약만 체크인 가능합니다.");
        }
        
        this.status = ReservationStatus.IN_PROGRESS;
        this.actualStartTime = LocalDateTime.now();
    }

    /**
     * 체크아웃 처리
     */
    public void checkOut() {
        if (this.status != ReservationStatus.IN_PROGRESS) {
            throw new IllegalStateException("진행 중인 예약만 체크아웃 가능합니다.");
        }
        
        this.status = ReservationStatus.COMPLETED;
        this.actualEndTime = LocalDateTime.now();
    }

    /**
     * 예약 시간 연장
     */
    public void extendTime(int minutes) {
        if (this.status != ReservationStatus.IN_PROGRESS) {
            throw new IllegalStateException("진행 중인 예약만 연장 가능합니다.");
        }
        
        this.endTime = this.endTime.plusMinutes(minutes);
    }

    /**
     * 예약 시간 수정
     */
    public void updateTime(LocalDateTime newStartTime, LocalDateTime newEndTime) {
        if (this.status == ReservationStatus.COMPLETED || this.status == ReservationStatus.CANCELLED) {
            throw new IllegalStateException("완료되거나 취소된 예약은 시간 수정이 불가능합니다.");
        }
        
        if (newEndTime.isBefore(newStartTime) || newEndTime.isEqual(newStartTime)) {
            throw new IllegalArgumentException("종료 시간은 시작 시간보다 늦어야 합니다.");
        }
        
        this.startTime = newStartTime;
        this.endTime = newEndTime;
    }

    /**
     * 예약 기본 정보 수정
     */
    public void updateBasicInfo(String title, String description, Integer attendeeCount) {
        if (this.status == ReservationStatus.COMPLETED || this.status == ReservationStatus.CANCELLED) {
            throw new IllegalStateException("완료되거나 취소된 예약은 수정이 불가능합니다.");
        }
        
        if (title != null && !title.trim().isEmpty()) {
            this.title = title;
        }
        if (description != null) {
            this.description = description;
        }
        if (attendeeCount != null && attendeeCount > 0) {
            this.attendeeCount = attendeeCount;
        }
    }

    /**
     * 예약 지속 시간 (분 단위)
     */
    public long getDurationInMinutes() {
        return java.time.Duration.between(startTime, endTime).toMinutes();
    }

    /**
     * 실제 사용 시간 (분 단위)
     */
    public long getActualDurationInMinutes() {
        if (actualStartTime != null && actualEndTime != null) {
            return java.time.Duration.between(actualStartTime, actualEndTime).toMinutes();
        }
        return 0;
    }

    /**
     * 예약이 현재 진행 중인지 확인
     */
    public boolean isCurrentlyInProgress() {
        LocalDateTime now = LocalDateTime.now();
        return this.status == ReservationStatus.IN_PROGRESS ||
               (this.status == ReservationStatus.CONFIRMED && 
                now.isAfter(this.startTime) && now.isBefore(this.endTime));
    }

    /**
     * 예약 취소 가능한지 확인 (시작 1시간 전까지)
     */
    public boolean isCancellable() {
        if (this.status == ReservationStatus.CANCELLED || this.status == ReservationStatus.COMPLETED) {
            return false;
        }
        
        LocalDateTime cancellationDeadline = this.startTime.minusHours(1);
        return LocalDateTime.now().isBefore(cancellationDeadline);
    }

    /**
     * 예약 정보를 문자열로 표현
     */
    @Override
    public String toString() {
        return String.format("Reservation{id=%d, title='%s', meetingRoomId=%d, startTime=%s, endTime=%s, status=%s}", 
                           id, title, meetingRoomId, startTime, endTime, status);
    }
}