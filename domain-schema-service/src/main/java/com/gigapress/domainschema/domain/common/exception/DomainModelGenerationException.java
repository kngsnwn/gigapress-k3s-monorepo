package com.gigapress.domainschema.domain.common.exception;

public class DomainModelGenerationException extends RuntimeException {
    
    public DomainModelGenerationException(String message) {
        super(message);
    }
    
    public DomainModelGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static DomainModelGenerationException invalidProjectId(String projectId) {
        return new DomainModelGenerationException(
            String.format("Invalid project ID for domain model generation: %s", projectId)
        );
    }
    
    public static DomainModelGenerationException generationFailed(String reason) {
        return new DomainModelGenerationException(
            String.format("Domain model generation failed: %s", reason)
        );
    }
}