package etners.reservation.entity;

/**
 * 예약 상태 Enum
 * 
 * 예약의 현재 상태를 나타내는 열거형
 * 
 * @author AI Engine Generated
 * @version 1.0.0
 */
public enum ReservationStatus {
    /**
     * 예약 대기 중 (승인 필요한 경우)
     */
    PENDING("예약 대기 중"),
    
    /**
     * 예약 확정
     */
    CONFIRMED("예약 확정"),
    
    /**
     * 사용 중 (체크인 완료)
     */
    IN_PROGRESS("사용 중"),
    
    /**
     * 사용 완료 (체크아웃 완료)
     */
    COMPLETED("사용 완료"),
    
    /**
     * 예약 취소
     */
    CANCELLED("예약 취소"),
    
    /**
     * 노쇼 (예약했으나 나타나지 않음)
     */
    NO_SHOW("노쇼");

    private final String description;

    ReservationStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * 활성 상태인지 확인 (사용 가능한 예약)
     */
    public boolean isActive() {
        return this == CONFIRMED || this == IN_PROGRESS;
    }

    /**
     * 완료 상태인지 확인
     */
    public boolean isFinished() {
        return this == COMPLETED || this == CANCELLED || this == NO_SHOW;
    }

    /**
     * 수정 가능한 상태인지 확인
     */
    public boolean isModifiable() {
        return this == PENDING || this == CONFIRMED;
    }

    /**
     * 취소 가능한 상태인지 확인
     */
    public boolean isCancellable() {
        return this == PENDING || this == CONFIRMED;
    }
}