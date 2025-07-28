package com.gigapress.domainschema.domain.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "domain_attributes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainAttribute {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String attributeName;
    
    @Column(nullable = false)
    private String attributeType;
    
    @Column(nullable = false)
    private Boolean required;
    
    @Column(nullable = false)
    private Boolean unique;
    
    private String defaultValue;
    
    @Column(length = 1000)
    private String description;
    
    @Column(length = 500)
    private String constraints;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_entity_id", nullable = false)
    private DomainEntity domainEntity;
}