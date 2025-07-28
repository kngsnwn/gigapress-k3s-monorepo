package com.gigapress.domainschema.domain.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemaGeneratedEvent {
    
    private String projectId;
    private String schemaId;
    private String schemaName;
    private String databaseType;
    private LocalDateTime generatedAt;
    private List<String> tables;
    private Map<String, Object> metadata;
    
    public String getAggregateId() {
        return projectId;
    }
}