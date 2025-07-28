package com.gigapress.domainschema.domain.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "index_designs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IndexDesign {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String indexName;
    
    @Column(nullable = false)
    private String indexType;
    
    @Column(nullable = false)
    private String columns;
    
    @Column(nullable = false)
    private Boolean unique;
    
    @Column(length = 1000)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_design_id", nullable = false)
    private TableDesign tableDesign;
}