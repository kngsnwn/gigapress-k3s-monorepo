-- Initial schema for GigaPress Light
-- Using public schema for simplicity

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    project_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Requirements table
CREATE TABLE IF NOT EXISTS requirements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    project_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Requirement metadata table
CREATE TABLE IF NOT EXISTS requirement_metadata (
    requirement_id BIGINT NOT NULL,
    metadata_key VARCHAR(255) NOT NULL,
    metadata_value TEXT,
    PRIMARY KEY (requirement_id, metadata_key),
    FOREIGN KEY (requirement_id) REFERENCES requirements(id) ON DELETE CASCADE
);

-- Domain models table
CREATE TABLE IF NOT EXISTS domain_models (
    id BIGSERIAL PRIMARY KEY,
    model_id VARCHAR(255) UNIQUE NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    description TEXT,
    model_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Domain entities table
CREATE TABLE IF NOT EXISTS domain_entities (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL,
    domain_model_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_model_id) REFERENCES domain_models(id) ON DELETE CASCADE
);

-- Domain attributes table
CREATE TABLE IF NOT EXISTS domain_attributes (
    id BIGSERIAL PRIMARY KEY,
    attribute_name VARCHAR(255) NOT NULL,
    attribute_type VARCHAR(255) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    unique_flag BOOLEAN NOT NULL DEFAULT FALSE,
    default_value TEXT,
    description TEXT,
    constraints TEXT,
    domain_entity_id BIGINT NOT NULL,
    FOREIGN KEY (domain_entity_id) REFERENCES domain_entities(id) ON DELETE CASCADE
);

-- Domain relationships table
CREATE TABLE IF NOT EXISTS domain_relationships (
    id BIGSERIAL PRIMARY KEY,
    relationship_name VARCHAR(255) NOT NULL,
    source_entity VARCHAR(255) NOT NULL,
    target_entity VARCHAR(255) NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    cardinality VARCHAR(50) NOT NULL,
    description TEXT,
    domain_model_id BIGINT NOT NULL,
    FOREIGN KEY (domain_model_id) REFERENCES domain_models(id) ON DELETE CASCADE
);

-- Schema designs table
CREATE TABLE IF NOT EXISTS schema_designs (
    id BIGSERIAL PRIMARY KEY,
    schema_id VARCHAR(255) UNIQUE NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    schema_name VARCHAR(255) NOT NULL,
    description TEXT,
    database_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Table designs table
CREATE TABLE IF NOT EXISTS table_designs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    description TEXT,
    schema_design_id BIGINT NOT NULL,
    FOREIGN KEY (schema_design_id) REFERENCES schema_designs(id) ON DELETE CASCADE
);

-- Column designs table
CREATE TABLE IF NOT EXISTS column_designs (
    id BIGSERIAL PRIMARY KEY,
    column_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(255) NOT NULL,
    length INTEGER,
    precision_val INTEGER,
    scale_val INTEGER,
    nullable BOOLEAN NOT NULL DEFAULT TRUE,
    default_value TEXT,
    primary_key BOOLEAN NOT NULL DEFAULT FALSE,
    unique_key BOOLEAN NOT NULL DEFAULT FALSE,
    foreign_key_table VARCHAR(255),
    foreign_key_column VARCHAR(255),
    description TEXT,
    table_design_id BIGINT NOT NULL,
    FOREIGN KEY (table_design_id) REFERENCES table_designs(id) ON DELETE CASCADE
);

-- Index designs table
CREATE TABLE IF NOT EXISTS index_designs (
    id BIGSERIAL PRIMARY KEY,
    index_name VARCHAR(255) NOT NULL,
    index_type VARCHAR(50) NOT NULL,
    columns TEXT NOT NULL,
    unique_flag BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    table_design_id BIGINT NOT NULL,
    FOREIGN KEY (table_design_id) REFERENCES table_designs(id) ON DELETE CASCADE
);

-- Create basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_requirements_project_id ON requirements(project_id);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements(status);
CREATE INDEX IF NOT EXISTS idx_requirements_type ON requirements(type);
CREATE INDEX IF NOT EXISTS idx_domain_models_project_id ON domain_models(project_id);
CREATE INDEX IF NOT EXISTS idx_schema_designs_project_id ON schema_designs(project_id);