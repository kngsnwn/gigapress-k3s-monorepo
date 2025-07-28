package com.gigapress.domainschema.domain.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "domain_entities")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String entityName;
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false)
    private String entityType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_model_id", nullable = false)
    private DomainModel domainModel;
    
    @OneToMany(mappedBy = "domainEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DomainAttribute> attributes = new ArrayList<>();
    
    // Helper methods
    public void addAttribute(DomainAttribute attribute) {
        attributes.add(attribute);
        attribute.setDomainEntity(this);
    }
    
    public void removeAttribute(DomainAttribute attribute) {
        attributes.remove(attribute);
        attribute.setDomainEntity(null);
    }
}