package com.gigapress.backend.service;

import com.gigapress.backend.dto.ChatMessageRequest;
import com.gigapress.backend.dto.ChatMessageResponse;
import com.gigapress.backend.entity.ChatMessage;
import com.gigapress.backend.entity.ChatSession;
import com.gigapress.backend.repository.ChatMessageRepository;
import com.gigapress.backend.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ChatMessageService {
    
    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;
    
    public ChatMessageResponse saveMessage(ChatMessageRequest request) {
        log.info("Saving message: {} for session: {}", request.getMessageId(), request.getSessionId());
        
        ChatSession session = getOrCreateSession(request);
        
        Long nextSequenceNumber = getNextSequenceNumber(session);
        
        ChatMessage message = ChatMessage.builder()
                .session(session)
                .messageId(request.getMessageId())
                .role(request.getRole())
                .content(request.getContent())
                .modelName(request.getModelName())
                .sequenceNumber(nextSequenceNumber)
                .status(request.getStatus() != null ? request.getStatus() : ChatMessage.MessageStatus.SENT)
                .metadata(request.getMetadata())
                .build();
        
        ChatMessage savedMessage = chatMessageRepository.save(message);
        log.info("Message saved with sequence number: {}", savedMessage.getSequenceNumber());
        
        return ChatMessageResponse.fromEntity(savedMessage);
    }
    
    private ChatSession getOrCreateSession(ChatMessageRequest request) {
        Optional<ChatSession> existingSession = chatSessionRepository.findBySessionId(request.getSessionId());
        
        if (existingSession.isPresent()) {
            return existingSession.get();
        }
        
        log.info("Creating new chat session: {}", request.getSessionId());
        ChatSession newSession = ChatSession.builder()
                .sessionId(request.getSessionId())
                .userId(request.getUserId())
                .projectId(request.getProjectId())
                .isActive(true)
                .metadata(new HashMap<>())
                .build();
        
        return chatSessionRepository.save(newSession);
    }
    
    private Long getNextSequenceNumber(ChatSession session) {
        Optional<Long> maxSequence = chatMessageRepository.findMaxSequenceNumberBySession(session);
        return maxSequence.orElse(0L) + 1;
    }
    
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessagesBySessionId(String sessionId) {
        log.info("Retrieving messages for session: {}", sessionId);
        
        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderBySequenceNumber(sessionId);
        return messages.stream()
                .map(ChatMessageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessagesByUserId(String userId, int page, int size) {
        log.info("Retrieving messages for user: {} (page: {}, size: {})", userId, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<ChatMessage> messages = chatMessageRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        return messages.stream()
                .skip((long) page * size)
                .limit(size)
                .map(ChatMessageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessagesByProjectId(String projectId, int page, int size) {
        log.info("Retrieving messages for project: {} (page: {}, size: {})", projectId, page, size);
        
        List<ChatMessage> messages = chatMessageRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        
        return messages.stream()
                .skip((long) page * size)
                .limit(size)
                .map(ChatMessageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<ChatMessageResponse> getMessageById(String messageId) {
        log.info("Retrieving message by ID: {}", messageId);
        
        return chatMessageRepository.findByMessageId(messageId)
                .map(ChatMessageResponse::fromEntity);
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> getMessageStats() {
        log.info("Retrieving message statistics");
        
        Map<String, Object> stats = new HashMap<>();
        
        long totalMessages = chatMessageRepository.count();
        long totalSessions = chatSessionRepository.count();
        long activeSessions = chatSessionRepository.findAllActiveSessions().size();
        long userMessages = chatMessageRepository.countByRole(ChatMessage.MessageRole.USER);
        long assistantMessages = chatMessageRepository.countByRole(ChatMessage.MessageRole.ASSISTANT);
        
        stats.put("totalMessages", totalMessages);
        stats.put("totalSessions", totalSessions);
        stats.put("activeSessions", activeSessions);
        stats.put("userMessages", userMessages);
        stats.put("assistantMessages", assistantMessages);
        stats.put("timestamp", OffsetDateTime.now());
        
        return stats;
    }
    
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getRecentMessages(int hours, int limit) {
        log.info("Retrieving recent messages from last {} hours (limit: {})", hours, limit);
        
        OffsetDateTime fromDate = OffsetDateTime.now().minusHours(hours);
        List<ChatMessage> messages = chatMessageRepository.findMessagesCreatedAfter(fromDate);
        
        return messages.stream()
                .limit(limit)
                .map(ChatMessageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public void deleteSession(String sessionId) {
        log.info("Deleting session: {}", sessionId);
        
        Optional<ChatSession> session = chatSessionRepository.findBySessionId(sessionId);
        if (session.isPresent()) {
            chatSessionRepository.delete(session.get());
            log.info("Session {} deleted successfully", sessionId);
        } else {
            log.warn("Session {} not found for deletion", sessionId);
        }
    }
    
    public void deactivateSession(String sessionId) {
        log.info("Deactivating session: {}", sessionId);
        
        Optional<ChatSession> sessionOpt = chatSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isPresent()) {
            ChatSession session = sessionOpt.get();
            session.setIsActive(false);
            chatSessionRepository.save(session);
            log.info("Session {} deactivated successfully", sessionId);
        } else {
            log.warn("Session {} not found for deactivation", sessionId);
        }
    }
}