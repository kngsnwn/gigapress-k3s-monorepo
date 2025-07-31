package com.gigapress.backend.repository;

import com.gigapress.backend.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {
    
    Optional<ChatSession> findBySessionId(String sessionId);
    
    List<ChatSession> findByUserId(String userId);
    
    List<ChatSession> findByProjectId(String projectId);
    
    List<ChatSession> findByUserIdAndProjectId(String userId, String projectId);
    
    @Query("SELECT cs FROM ChatSession cs WHERE cs.isActive = true")
    List<ChatSession> findAllActiveSessions();
    
    @Query("SELECT cs FROM ChatSession cs WHERE cs.userId = :userId AND cs.isActive = true ORDER BY cs.updatedAt DESC")
    List<ChatSession> findActiveSessionsByUserId(@Param("userId") String userId);
    
    @Query("SELECT cs FROM ChatSession cs WHERE cs.projectId = :projectId AND cs.isActive = true ORDER BY cs.updatedAt DESC")
    List<ChatSession> findActiveSessionsByProjectId(@Param("projectId") String projectId);
    
    @Query("SELECT cs FROM ChatSession cs WHERE cs.createdAt >= :fromDate ORDER BY cs.createdAt DESC")
    List<ChatSession> findSessionsCreatedAfter(@Param("fromDate") OffsetDateTime fromDate);
    
    @Query("SELECT COUNT(cs) FROM ChatSession cs WHERE cs.userId = :userId AND cs.isActive = true")
    long countActiveSessionsByUserId(@Param("userId") String userId);
    
    @Query("SELECT COUNT(cs) FROM ChatSession cs WHERE cs.projectId = :projectId AND cs.isActive = true")
    long countActiveSessionsByProjectId(@Param("projectId") String projectId);
}