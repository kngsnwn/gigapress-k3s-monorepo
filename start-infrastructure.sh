#!/bin/bash

echo "Starting GigaPress Light infrastructure..."

# Start infrastructure services first
echo "Starting infrastructure services..."
docker-compose up -d postgres neo4j zookeeper kafka redis

# Wait for infrastructure to be ready
echo "Waiting for infrastructure services to be ready..."
sleep 30

# Create Kafka topics
echo "Creating Kafka topics..."
docker exec gigapress-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --topic project-events --partitions 3 --replication-factor 1
docker exec gigapress-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --topic schema-updates --partitions 3 --replication-factor 1
docker exec gigapress-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --topic conversation-events --partitions 3 --replication-factor 1

# Start application services
echo "Starting application services..."
docker-compose up -d backend-service domain-schema-service conversational-ai-engine conversational-layer

echo "GigaPress Light infrastructure started successfully!"
echo "Services available at:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8080"
echo "  - Domain Schema API: http://localhost:8081"
echo "  - AI Engine API: http://localhost:8000"
echo "  - Neo4j Browser: http://localhost:7474"
echo "  - PostgreSQL: localhost:5432"