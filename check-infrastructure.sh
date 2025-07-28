#!/bin/bash

echo "Checking GigaPress Light infrastructure status..."
echo "================================================"

# Check Docker containers
echo "\nDocker Containers:"
docker-compose ps

# Check PostgreSQL
echo "\nPostgreSQL Status:"
docker exec gigapress-postgres pg_isready -U gigapress -d gigapress_domain || echo "PostgreSQL is not ready"

# Check Neo4j
echo "\nNeo4j Status:"
curl -s http://localhost:7474 > /dev/null && echo "Neo4j is running on http://localhost:7474" || echo "Neo4j is not accessible"

# Check Kafka
echo "\nKafka Topics:"
docker exec gigapress-kafka kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null || echo "Kafka is not ready"

# Check Redis
echo "\nRedis Status:"
docker exec gigapress-redis redis-cli -a redis123 ping 2>/dev/null && echo "Redis is running" || echo "Redis is not ready"

# Check application services
echo "\nApplication Services:"
echo -n "Backend Service: "
curl -s http://localhost:8080/actuator/health > /dev/null && echo "Running" || echo "Not accessible"
echo -n "Domain Schema Service: "
curl -s http://localhost:8081/actuator/health > /dev/null && echo "Running" || echo "Not accessible"
echo -n "AI Engine: "
curl -s http://localhost:8000/health > /dev/null && echo "Running" || echo "Not accessible"
echo -n "Frontend: "
curl -s http://localhost:3000 > /dev/null && echo "Running" || echo "Not accessible"

echo "\n================================================"