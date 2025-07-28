package com.gigapress.domainschema.domain.common.repository;

import com.gigapress.domainschema.domain.common.entity.SchemaDesign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SchemaDesignRepository extends JpaRepository<SchemaDesign, Long> {
    
    Optional<SchemaDesign> findByProjectId(String projectId);
    
    @Query("SELECT sd FROM SchemaDesign sd LEFT JOIN FETCH sd.tables WHERE sd.projectId = :projectId")
    Optional<SchemaDesign> findByProjectIdWithTables(@Param("projectId") String projectId);
    
    boolean existsByProjectId(String projectId);
}
