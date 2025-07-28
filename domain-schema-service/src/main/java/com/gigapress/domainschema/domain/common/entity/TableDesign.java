package com.gigapress.domainschema.domain.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "table_designs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableDesign {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String tableName;
    
    @Column(length = 1000)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schema_design_id", nullable = false)
    private SchemaDesign schemaDesign;
    
    @OneToMany(mappedBy = "tableDesign", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ColumnDesign> columns = new ArrayList<>();
    
    @OneToMany(mappedBy = "tableDesign", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<IndexDesign> indexes = new ArrayList<>();
    
    // Helper methods
    public void addColumn(ColumnDesign column) {
        columns.add(column);
        column.setTableDesign(this);
    }
    
    public void removeColumn(ColumnDesign column) {
        columns.remove(column);
        column.setTableDesign(null);
    }
    
    public void addIndex(IndexDesign index) {
        indexes.add(index);
        index.setTableDesign(this);
    }
    
    public void removeIndex(IndexDesign index) {
        indexes.remove(index);
        index.setTableDesign(null);
    }
}