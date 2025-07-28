package com.gigapress.domainschema.domain.common.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "domain_models")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainModel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String modelId;
    
    @Column(nullable = false)
    private String projectId;
    
    @Column(nullable = false)
    private String modelName;
    
    @Column(length = 2000)
    private String description;
    
    @Column(nullable = false)
    private String modelType;
    
    @OneToMany(mappedBy = "domainModel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DomainEntity> entities = new ArrayList<>();
    
    @OneToMany(mappedBy = "domainModel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DomainRelationship> relationships = new ArrayList<>();
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private String createdBy;
    
    private String updatedBy;
    
    // Helper methods
    public void addEntity(DomainEntity entity) {
        entities.add(entity);
        entity.setDomainModel(this);
    }
    
    public void removeEntity(DomainEntity entity) {
        entities.remove(entity);
        entity.setDomainModel(null);
    }
    
    public void addRelationship(DomainRelationship relationship) {
        relationships.add(relationship);
        relationship.setDomainModel(this);
    }
    
    public void removeRelationship(DomainRelationship relationship) {
        relationships.remove(relationship);
        relationship.setDomainModel(null);
    }
}