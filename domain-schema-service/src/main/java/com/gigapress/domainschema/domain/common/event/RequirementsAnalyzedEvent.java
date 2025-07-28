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
public class RequirementsAnalyzedEvent {
    
    private String projectId;
    private String analysisId;
    private LocalDateTime timestamp;
    private String status;
    
    private List<AnalyzedEntity> entities;
    private List<AnalyzedRelationship> relationships;
    private Map<String, Object> metadata;
    private int totalRequirements;
    private List<String> requirementIds;
    
    public String getAggregateId() {
        return projectId;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalyzedEntity {
        private String name;
        private String type;
        private List<String> attributes;
        private Map<String, String> properties;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalyzedRelationship {
        private String sourceEntity;
        private String targetEntity;
        private String relationshipType;
        private String cardinality;
    }
}