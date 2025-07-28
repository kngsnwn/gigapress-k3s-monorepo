package com.gigapress.domainschema.domain.common.exception;

public class InvalidRequirementException extends RuntimeException {
    
    public InvalidRequirementException(String message) {
        super(message);
    }
    
    public InvalidRequirementException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static InvalidRequirementException emptyTitle() {
        return new InvalidRequirementException("Requirement title cannot be empty");
    }
    
    public static InvalidRequirementException invalidType(String type) {
        return new InvalidRequirementException(
            String.format("Invalid requirement type: %s", type)
        );
    }
    
    public static InvalidRequirementException invalidPriority(String priority) {
        return new InvalidRequirementException(
            String.format("Invalid requirement priority: %s", priority)
        );
    }
}