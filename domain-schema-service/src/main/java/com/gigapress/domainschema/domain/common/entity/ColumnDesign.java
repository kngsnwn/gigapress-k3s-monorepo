package com.gigapress.domainschema.domain.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "column_designs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColumnDesign {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String columnName;
    
    @Column(nullable = false)
    private String dataType;
    
    private Integer length;
    
    private Integer precision;
    
    private Integer scale;
    
    @Column(nullable = false)
    private Boolean nullable;
    
    private String defaultValue;
    
    @Column(nullable = false)
    private Boolean primaryKey;
    
    @Column(nullable = false)
    private Boolean uniqueKey;
    
    private String foreignKeyTable;
    
    private String foreignKeyColumn;
    
    @Column(length = 1000)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_design_id", nullable = false)
    private TableDesign tableDesign;
}