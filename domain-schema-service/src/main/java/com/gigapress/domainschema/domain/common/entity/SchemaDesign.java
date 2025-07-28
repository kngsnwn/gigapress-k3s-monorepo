package com.gigapress.domainschema.domain.common.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "schema_designs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemaDesign {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String schemaId;
    
    @Column(nullable = false)
    private String projectId;
    
    @Column(nullable = false)
    private String schemaName;
    
    @Column(length = 2000)
    private String description;
    
    @Column(nullable = false)
    private String databaseType;
    
    @OneToMany(mappedBy = "schemaDesign", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TableDesign> tables = new ArrayList<>();
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private String createdBy;
    
    private String updatedBy;
    
    // Helper methods
    public void addTable(TableDesign table) {
        tables.add(table);
        table.setSchemaDesign(this);
    }
    
    public void removeTable(TableDesign table) {
        tables.remove(table);
        table.setSchemaDesign(null);
    }
}