package com.gigapress.domainschema.domain.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HealthController {
    
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
            "status", "UP",
            "service", "domain-schema-service",
            "version", "1.0.0"
        );
    }
}
