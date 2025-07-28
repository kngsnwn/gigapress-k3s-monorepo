#!/bin/bash

echo "Stopping GigaPress Light infrastructure..."

# Stop all services
docker-compose down

echo "GigaPress Light infrastructure stopped."

# Optional: Remove volumes (uncomment if needed)
# echo "Removing data volumes..."
# docker-compose down -v