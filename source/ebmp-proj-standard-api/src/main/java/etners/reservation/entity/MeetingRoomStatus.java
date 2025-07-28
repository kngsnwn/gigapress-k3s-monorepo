package etners.reservation.entity;

/**
 * 회의실 상태 Enum
 * 
 * 회의실의 현재 상태를 나타내는 열거형
 * 
 * @author AI Engine Generated
 * @version 1.0.0
 */
public enum MeetingRoomStatus {
    /**
     * 사용 가능
     */
    AVAILABLE("사용 가능"),
    
    /**
     * 사용 중
     */
    IN_USE("사용 중"),
    
    /**
     * 점검 중
     */
    MAINTENANCE("점검 중"),
    
    /**
     * 사용 불가 (고장 등)
     */
    UNAVAILABLE("사용 불가");

    private final String description;

    MeetingRoomStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * 예약 가능한 상태인지 확인
     */
    public boolean isBookable() {
        return this == AVAILABLE;
    }
}