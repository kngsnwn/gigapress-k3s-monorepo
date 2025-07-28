#!/bin/bash

# Service control script for Unix/Linux/Mac
ACTION=$1
MODE=$2

BASE_PATH="/home/gigapress/services"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Service configurations
declare -A beginner_services=(
    ["conversational-ai-engine"]="8087|python|$BASE_PATH/conversational-ai-engine"
    ["mcp-server"]="8082|java|$BASE_PATH/mcp-server"
    ["domain-schema-service"]="8083|java|$BASE_PATH/domain-schema-service"
    ["backend-service"]="8084|java|$BASE_PATH/backend-service"
)

declare -A expert_services=(
    ["conversational-ai-engine"]="8087|python|$BASE_PATH/conversational-ai-engine"
    ["mcp-server"]="8082|java|$BASE_PATH/mcp-server"
    ["domain-schema-service"]="8083|java|$BASE_PATH/domain-schema-service"
    ["backend-service"]="8084|java|$BASE_PATH/backend-service"
    ["design-frontend-service"]="8085|node|$BASE_PATH/design-frontend-service"
    ["infra-version-control-service"]="8086|python|$BASE_PATH/infra-version-control-service"
    ["dynamic-update-engine"]="8081|java|$BASE_PATH/dynamic-update-engine"
)

start_service() {
    local name=$1
    local port=$2
    local type=$3
    local path=$4
    
    echo -e "${GREEN}Starting $name on port $port...${NC}"
    
    case $type in
        python)
            cd "$path" && nohup python main.py > /dev/null 2>&1 &
            ;;
        java)
            cd "$path" && nohup ./gradlew bootRun > /dev/null 2>&1 &
            ;;
        node)
            cd "$path" && nohup npm start > /dev/null 2>&1 &
            ;;
    esac
}

stop_service() {
    local port=$1
    
    echo -e "${YELLOW}Stopping service on port $port...${NC}"
    
    # Find and kill process using the port
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        kill -9 $pid 2>/dev/null
    fi
}

check_service() {
    local port=$1
    
    if lsof -i:$port >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Get services based on mode
get_services() {
    case $MODE in
        beginner)
            echo "${!beginner_services[@]}"
            ;;
        expert)
            echo "${!expert_services[@]}"
            ;;
        *)
            echo "Invalid mode: $MODE"
            exit 1
            ;;
    esac
}

# Main execution
case $ACTION in
    start)
        echo -e "${CYAN}Starting services in $MODE mode...${NC}"
        
        services=$(get_services)
        for service in $services; do
            if [ "$MODE" = "beginner" ]; then
                IFS='|' read -r port type path <<< "${beginner_services[$service]}"
            else
                IFS='|' read -r port type path <<< "${expert_services[$service]}"
            fi
            
            if ! check_service $port; then
                start_service "$service" "$port" "$type" "$path"
                sleep 2
            else
                echo -e "$service is already running"
            fi
        done
        
        echo -e "\n${GREEN}All services started!${NC}"
        ;;
        
    stop)
        echo -e "${CYAN}Stopping services in $MODE mode...${NC}"
        
        services=$(get_services)
        for service in $services; do
            if [ "$MODE" = "beginner" ]; then
                IFS='|' read -r port type path <<< "${beginner_services[$service]}"
            else
                IFS='|' read -r port type path <<< "${expert_services[$service]}"
            fi
            
            if check_service $port; then
                stop_service $port
            fi
        done
        
        echo -e "\n${GREEN}All services stopped!${NC}"
        ;;
        
    status)
        echo -e "${CYAN}Checking service status...${NC}"
        
        services=$(get_services)
        for service in $services; do
            if [ "$MODE" = "beginner" ]; then
                IFS='|' read -r port type path <<< "${beginner_services[$service]}"
            else
                IFS='|' read -r port type path <<< "${expert_services[$service]}"
            fi
            
            if check_service $port; then
                echo -e "${GREEN}$service (port $port): Running${NC}"
            else
                echo -e "${RED}$service (port $port): Stopped${NC}"
            fi
        done
        ;;
        
    *)
        echo "Usage: $0 {start|stop|status} {beginner|expert}"
        exit 1
        ;;
esac

# Usage examples:
# ./service-control.sh start beginner
# ./service-control.sh stop expert
# ./service-control.sh status beginner