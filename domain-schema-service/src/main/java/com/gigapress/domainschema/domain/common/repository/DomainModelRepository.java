package com.gigapress.domainschema.domain.common.repository;

import com.gigapress.domainschema.domain.common.entity.DomainModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DomainModelRepository extends JpaRepository<DomainModel, Long> {
    
    Optional<DomainModel> findByModelId(String modelId);
    
    List<DomainModel> findByProjectId(String projectId);
    
    @Query("SELECT dm FROM DomainModel dm LEFT JOIN FETCH dm.entities e LEFT JOIN FETCH e.attributes WHERE dm.modelId = :modelId")
    Optional<DomainModel> findByModelIdWithEntities(@Param("modelId") String modelId);
    
    @Query("SELECT dm FROM DomainModel dm LEFT JOIN FETCH dm.relationships WHERE dm.modelId = :modelId")
    Optional<DomainModel> findByModelIdWithRelationships(@Param("modelId") String modelId);
    
    boolean existsByProjectIdAndModelName(String projectId, String modelName);
}
