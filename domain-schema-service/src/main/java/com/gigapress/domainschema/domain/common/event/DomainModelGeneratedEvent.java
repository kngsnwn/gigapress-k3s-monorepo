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
public class DomainModelGeneratedEvent {
    
    private String projectId;
    private String modelId;
    private String modelName;
    private LocalDateTime generatedAt;
    private List<String> entities;
    private List<String> relationships;
    private Map<String, Object> metadata;
    
    public String getAggregateId() {
        return projectId;
    }
}