package com.gigapress.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    
    private String status;
    private String error;
    private String message;
    private String path;
    private LocalDateTime timestamp;
    private Integer code;
    private String traceId;
    private List<ValidationError> validationErrors;
    private Map<String, Object> details;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ValidationError {
        private String field;
        private Object rejectedValue;
        private String message;
        private String code;
    }
    
    public static ErrorResponse of(String message) {
        return ErrorResponse.builder()
                .status("error")
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static ErrorResponse of(String message, String error) {
        return ErrorResponse.builder()
                .status("error")
                .error(error)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static ErrorResponse of(String message, String error, List<ValidationError> validationErrors) {
        return ErrorResponse.builder()
                .status("error")
                .error(error)
                .message(message)
                .validationErrors(validationErrors)
                .timestamp(LocalDateTime.now())
                .build();
    }
}