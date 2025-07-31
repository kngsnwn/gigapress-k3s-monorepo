package com.gigapress.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gigapress.backend.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChatMessageRequest {
    
    @NotBlank(message = "Session ID is required")
    private String sessionId;
    
    @NotBlank(message = "Message ID is required")
    private String messageId;
    
    @NotNull(message = "Role is required")
    private ChatMessage.MessageRole role;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    private String modelName;
    
    private String userId;
    
    private String projectId;
    
    private ChatMessage.MessageStatus status;
    
    private Map<String, Object> metadata;
}