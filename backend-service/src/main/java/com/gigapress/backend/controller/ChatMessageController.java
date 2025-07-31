package com.gigapress.backend.controller;

import com.gigapress.backend.dto.ChatMessageRequest;
import com.gigapress.backend.dto.ChatMessageResponse;
import com.gigapress.backend.dto.ErrorResponse;
import com.gigapress.backend.service.ChatMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat Messages", description = "Chat Message Management API")
public class ChatMessageController {
    
    private final ChatMessageService chatMessageService;
    
    @Operation(
        summary = "Save Chat Message",
        description = "Save a new chat message to the database with session tracking and sequence ordering"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Message saved successfully",
                content = @Content(schema = @Schema(implementation = ChatMessageResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request data",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/messages")
    public ResponseEntity<?> saveMessage(
            @Valid @RequestBody ChatMessageRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            log.info("Saving chat message: {} for session: {}", request.getMessageId(), request.getSessionId());
            
            ChatMessageResponse response = chatMessageService.saveMessage(request);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid message request: {}", e.getMessage());
            ErrorResponse error = ErrorResponse.of(e.getMessage(), "INVALID_REQUEST");
            error.setPath(httpRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            
        } catch (Exception e) {
            log.error("Error saving chat message", e);
            ErrorResponse error = ErrorResponse.of("Failed to save chat message", "INTERNAL_ERROR");
            error.setPath(httpRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Get Messages by Session",
        description = "Retrieve all messages for a specific chat session ordered by sequence"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Messages retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Session not found",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<?> getMessagesBySession(
            @Parameter(description = "Session ID", required = true)
            @PathVariable String sessionId,
            HttpServletRequest httpRequest) {
        
        try {
            log.info("Retrieving messages for session: {}", sessionId);
            
            List<ChatMessageResponse> messages = chatMessageService.getMessagesBySessionId(sessionId);
            
            return ResponseEntity.ok(messages);
            
        } catch (Exception e) {
            log.error("Error retrieving messages for session: {}", sessionId, e);
            ErrorResponse error = ErrorResponse.of("Failed to retrieve messages", "INTERNAL_ERROR");
            error.setPath(httpRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Get Messages by User",
        description = "Retrieve messages for a specific user with pagination"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Messages retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/users/{userId}/messages")
    public ResponseEntity<?> getMessagesByUser(
            @Parameter(description = "User ID", required = true)
            @PathVariable String userId,
            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest httpRequest) {
        
        try {
            log.info("Retrieving messages for user: {} (page: {}, size: {})", userId, page, size);
            
            List<ChatMessageResponse> messages = chatMessageService.getMessagesByUserId(userId, page, size);
            
            return ResponseEntity.ok(messages);
            
        } catch (Exception e) {
            log.error("Error retrieving messages for user: {}", userId, e);
            ErrorResponse error = ErrorResponse.of("Failed to retrieve messages", "INTERNAL_ERROR");
            error.setPath(httpRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Get Messages by Project",
        description = "Retrieve messages for a specific project with pagination"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Messages retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/projects/{projectId}/messages")
    public ResponseEntity<?> getMessagesByProject(
            @Parameter(description = "Project ID", required = true)
            @PathVariable String projectId,
            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest httpRequest) {
        
        try {
            log.info("Retrieving messages for project: {} (page: {}, size: {})", projectId, page, size);
            
            List<ChatMessageResponse> messages = chatMessageService.getMessagesByProjectId(projectId, page, size);
            
            return ResponseEntity.ok(messages);
            
        } catch (Exception e) {
            log.error("Error retrieving messages for project: {}", projectId, e);
            ErrorResponse error = ErrorResponse.of("Failed to retrieve messages", "INTERNAL_ERROR");
            error.setPath(httpRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Get Message by ID",
        description = "Retrieve a specific message by its ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Message found",
                content = @Content(schema = @Schema(implementation = ChatMessageResponse.class))),
        @ApiResponse(responseCode = "404", description = "Message not found",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/messages/{messageId}")
    public ResponseEntity<?> getMessageById(
            @Parameter(description = "Message ID", required = true)
            @PathVariable String messageId,
            HttpServletRequest httpRequest) {
        
        try {
            log.info("Retrieving message: {}", messageId);
            
            Optional<ChatMessageResponse> message = chatMessageService.getMessageById(messageId);
            
            if (message.isPresent()) {
                return ResponseEntity.ok(message.get());
            }
            
            ErrorResponse error = ErrorResponse.of(
                    String.format("Message '%s' not found", messageId),
                    "MESSAGE_NOT_FOUND"
            );
            error.setPath(httpRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            
        } catch (Exception e) {
            log.error("Error retrieving message: {}", messageId, e);
            ErrorResponse error = ErrorResponse.of("Failed to retrieve message", "INTERNAL_ERROR");
            error.setPath(httpRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Get Chat Statistics",
        description = "Retrieve statistics about chat messages and sessions"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/stats")
    public ResponseEntity<?> getChatStats(HttpServletRequest httpRequest) {
        
        try {
            log.info("Retrieving chat statistics");
            
            Map<String, Object> stats = chatMessageService.getMessageStats();
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error retrieving chat statistics", e);
            ErrorResponse error = ErrorResponse.of("Failed to retrieve statistics", "INTERNAL_ERROR");
            error.setPath(httpRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Get Recent Messages",
        description = "Retrieve recent messages from the last specified hours"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Recent messages retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/messages/recent")
    public ResponseEntity<?> getRecentMessages(
            @Parameter(description = "Hours to look back")
            @RequestParam(defaultValue = "24") int hours,
            @Parameter(description = "Maximum number of messages to return")
            @RequestParam(defaultValue = "100") int limit,
            HttpServletRequest httpRequest) {
        
        try {
            log.info("Retrieving recent messages from last {} hours (limit: {})", hours, limit);
            
            List<ChatMessageResponse> messages = chatMessageService.getRecentMessages(hours, limit);
            
            return ResponseEntity.ok(messages);
            
        } catch (Exception e) {
            log.error("Error retrieving recent messages", e);
            ErrorResponse error = ErrorResponse.of("Failed to retrieve recent messages", "INTERNAL_ERROR");
            error.setPath(httpRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Delete Session",
        description = "Delete a chat session and all its messages"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Session deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Session not found",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<?> deleteSession(
            @Parameter(description = "Session ID", required = true)
            @PathVariable String sessionId,
            HttpServletRequest httpRequest) {
        
        try {
            log.info("Deleting session: {}", sessionId);
            
            chatMessageService.deleteSession(sessionId);
            
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            log.error("Error deleting session: {}", sessionId, e);
            ErrorResponse error = ErrorResponse.of("Failed to delete session", "INTERNAL_ERROR");
            error.setPath(httpRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Deactivate Session",
        description = "Mark a chat session as inactive without deleting it"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Session deactivated successfully"),
        @ApiResponse(responseCode = "404", description = "Session not found",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/sessions/{sessionId}/deactivate")
    public ResponseEntity<?> deactivateSession(
            @Parameter(description = "Session ID", required = true)
            @PathVariable String sessionId,
            HttpServletRequest httpRequest) {
        
        try {
            log.info("Deactivating session: {}", sessionId);
            
            chatMessageService.deactivateSession(sessionId);
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error deactivating session: {}", sessionId, e);
            ErrorResponse error = ErrorResponse.of("Failed to deactivate session", "INTERNAL_ERROR");
            error.setPath(httpRequest.getRequestURI());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}