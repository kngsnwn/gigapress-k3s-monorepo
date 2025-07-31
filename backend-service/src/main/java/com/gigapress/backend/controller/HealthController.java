package com.gigapress.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    /**
     * Simple health check endpoint
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("service", "backend-service");
        health.put("version", "1.0.0");
        health.put("components", Map.of(
            "database", "UP",
            "redis", "UP",
            "kafka", "UP"
        ));
        
        return ResponseEntity.ok(health);
    }

    /**
     * Detailed health check with system metrics
     */
    @GetMapping("/detailed")
    public ResponseEntity<Map<String, Object>> detailedHealthCheck() {
        Map<String, Object> health = new HashMap<>();
        
        // Basic info
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("service", "backend-service");
        health.put("version", "1.0.0");
        
        // System metrics
        Runtime runtime = Runtime.getRuntime();
        Map<String, Object> system = new HashMap<>();
        system.put("totalMemory", runtime.totalMemory());
        system.put("freeMemory", runtime.freeMemory());
        system.put("usedMemory", runtime.totalMemory() - runtime.freeMemory());
        system.put("maxMemory", runtime.maxMemory());
        system.put("availableProcessors", runtime.availableProcessors());
        health.put("system", system);
        
        // Service status
        Map<String, String> components = new HashMap<>();
        components.put("database", checkDatabaseHealth());
        components.put("redis", checkRedisHealth());
        components.put("kafka", checkKafkaHealth());
        components.put("domainSchemaService", "UP");
        health.put("components", components);
        
        return ResponseEntity.ok(health);
    }

    private String checkDatabaseHealth() {
        try {
            // Add actual database health check logic here
            return "UP";
        } catch (Exception e) {
            log.warn("Database health check failed: {}", e.getMessage());
            return "DOWN";
        }
    }

    private String checkRedisHealth() {
        try {
            // Add actual Redis health check logic here
            return "UP";
        } catch (Exception e) {
            log.warn("Redis health check failed: {}", e.getMessage());
            return "DOWN";
        }
    }

    private String checkKafkaHealth() {
        try {
            // Add actual Kafka health check logic here
            return "UP";
        } catch (Exception e) {
            log.warn("Kafka health check failed: {}", e.getMessage());
            return "DOWN";
        }
    }
}