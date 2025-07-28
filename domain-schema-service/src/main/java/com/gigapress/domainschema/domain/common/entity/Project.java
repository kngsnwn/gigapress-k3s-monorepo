package com.gigapress.domainschema.domain.common.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String projectId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 2000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectType projectType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Requirement> requirements = new ArrayList<>();
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private String createdBy;
    
    private String updatedBy;
    
    // Helper methods
    public void addRequirement(Requirement requirement) {
        requirements.add(requirement);
        requirement.setProject(this);
    }
    
    public void removeRequirement(Requirement requirement) {
        requirements.remove(requirement);
        requirement.setProject(null);
    }
    
    public void updateStatus(ProjectStatus newStatus) {
        this.status = newStatus;
    }
}