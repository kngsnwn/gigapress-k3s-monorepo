package com.gigapress.domainschema.domain.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "domain_relationships")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainRelationship {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String relationshipName;
    
    @Column(nullable = false)
    private String sourceEntity;
    
    @Column(nullable = false)
    private String targetEntity;
    
    @Column(nullable = false)
    private String relationshipType;
    
    @Column(nullable = false)
    private String cardinality;
    
    @Column(length = 1000)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_model_id", nullable = false)
    private DomainModel domainModel;
}