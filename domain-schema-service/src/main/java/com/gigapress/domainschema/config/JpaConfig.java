package com.gigapress.domainschema.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.gigapress.domainschema")
@EnableJpaAuditing
@EnableTransactionManagement
public class JpaConfig {
}
