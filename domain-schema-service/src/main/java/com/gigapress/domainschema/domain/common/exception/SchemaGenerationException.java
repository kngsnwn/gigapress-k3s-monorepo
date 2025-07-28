package com.gigapress.domainschema.domain.common.exception;

public class SchemaGenerationException extends RuntimeException {
    
    public SchemaGenerationException(String message) {
        super(message);
    }
    
    public SchemaGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static SchemaGenerationException invalidDomainModel(String modelId) {
        return new SchemaGenerationException(
            String.format("Invalid domain model for schema generation: %s", modelId)
        );
    }
    
    public static SchemaGenerationException generationFailed(String reason) {
        return new SchemaGenerationException(
            String.format("Schema generation failed: %s", reason)
        );
    }
    
    public static SchemaGenerationException unsupportedDatabaseType(String dbType) {
        return new SchemaGenerationException(
            String.format("Unsupported database type: %s", dbType)
        );
    }
}