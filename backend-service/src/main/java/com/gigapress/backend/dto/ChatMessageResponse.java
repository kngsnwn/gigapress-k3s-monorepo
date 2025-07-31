package com.gigapress.backend.dto;

import com.gigapress.backend.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    
    private UUID id;
    private String sessionId;
    private String messageId;
    private ChatMessage.MessageRole role;
    private String content;
    private String modelName;
    private Long sequenceNumber;
    private OffsetDateTime createdAt;
    private ChatMessage.MessageStatus status;
    private Map<String, Object> metadata;
    
    // Session information
    private String userId;
    private String projectId;
    
    public static ChatMessageResponse fromEntity(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .sessionId(message.getSession().getSessionId())
                .messageId(message.getMessageId())
                .role(message.getRole())
                .content(message.getContent())
                .modelName(message.getModelName())
                .sequenceNumber(message.getSequenceNumber())
                .createdAt(message.getCreatedAt())
                .status(message.getStatus())
                .metadata(message.getMetadata())
                .userId(message.getSession().getUserId())
                .projectId(message.getSession().getProjectId())
                .build();
    }
}