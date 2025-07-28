package com.gigapress.domainschema.domain.common.exception;

public class ProjectNotFoundException extends RuntimeException {
    
    public ProjectNotFoundException(String message) {
        super(message);
    }
    
    public ProjectNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static ProjectNotFoundException byId(String projectId) {
        return new ProjectNotFoundException(
            String.format("Project not found with id: %s", projectId)
        );
    }
    
    public static ProjectNotFoundException byName(String projectName) {
        return new ProjectNotFoundException(
            String.format("Project not found with name: %s", projectName)
        );
    }
}