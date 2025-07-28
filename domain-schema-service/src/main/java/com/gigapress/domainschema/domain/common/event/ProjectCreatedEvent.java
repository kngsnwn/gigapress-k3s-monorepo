package com.gigapress.domainschema.domain.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCreatedEvent {
    
    private String projectId;
    private String projectName;
    private String projectType;
    private String description;
    private LocalDateTime createdAt;
    private String createdBy;
    
    public String getAggregateId() {
        return projectId;
    }
}