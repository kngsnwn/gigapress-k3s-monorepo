package com.gigapress.backend.repository;

import com.gigapress.backend.entity.ChatMessage;
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
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    
    Optional<ChatMessage> findByMessageId(String messageId);
    
    List<ChatMessage> findBySessionOrderBySequenceNumber(ChatSession session);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.session.sessionId = :sessionId ORDER BY cm.sequenceNumber")
    List<ChatMessage> findBySessionIdOrderBySequenceNumber(@Param("sessionId") String sessionId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.session.userId = :userId ORDER BY cm.createdAt DESC")
    List<ChatMessage> findByUserIdOrderByCreatedAtDesc(@Param("userId") String userId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.session.projectId = :projectId ORDER BY cm.createdAt DESC")
    List<ChatMessage> findByProjectIdOrderByCreatedAtDesc(@Param("projectId") String projectId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.role = :role ORDER BY cm.createdAt DESC")
    List<ChatMessage> findByRoleOrderByCreatedAtDesc(@Param("role") ChatMessage.MessageRole role);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.modelName = :modelName ORDER BY cm.createdAt DESC")
    List<ChatMessage> findByModelNameOrderByCreatedAtDesc(@Param("modelName") String modelName);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.createdAt >= :fromDate ORDER BY cm.createdAt DESC")
    List<ChatMessage> findMessagesCreatedAfter(@Param("fromDate") OffsetDateTime fromDate);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.createdAt BETWEEN :fromDate AND :toDate ORDER BY cm.createdAt DESC")
    List<ChatMessage> findMessagesBetweenDates(@Param("fromDate") OffsetDateTime fromDate, @Param("toDate") OffsetDateTime toDate);
    
    @Query("SELECT MAX(cm.sequenceNumber) FROM ChatMessage cm WHERE cm.session = :session")
    Optional<Long> findMaxSequenceNumberBySession(@Param("session") ChatSession session);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.session.sessionId = :sessionId")
    long countBySessionId(@Param("sessionId") String sessionId);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.session.userId = :userId")
    long countByUserId(@Param("userId") String userId);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.session.projectId = :projectId")
    long countByProjectId(@Param("projectId") String projectId);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.role = :role")
    long countByRole(@Param("role") ChatMessage.MessageRole role);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.modelName = :modelName")
    long countByModelName(@Param("modelName") String modelName);
}