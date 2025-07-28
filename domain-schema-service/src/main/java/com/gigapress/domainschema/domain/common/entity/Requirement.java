package com.gigapress.domainschema.domain.common.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "requirements")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Requirement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 5000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequirementType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequirementPriority priority;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequirementStatus status;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private String createdBy;
    
    private String updatedBy;
    
    @ElementCollection
    @CollectionTable(name = "requirement_metadata", joinColumns = @JoinColumn(name = "requirement_id"))
    @MapKeyColumn(name = "metadata_key")
    @Column(name = "metadata_value")
    private Map<String, String> metadata;
    
    public void updateStatus(RequirementStatus newStatus) {
        this.status = newStatus;
    }
}