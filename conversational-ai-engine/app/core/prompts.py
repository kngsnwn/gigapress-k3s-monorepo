from langchain.prompts import PromptTemplate, ChatPromptTemplate
from langchain.schema import SystemMessage
from typing import Dict


# Project generation prompts
PROJECT_ANALYSIS_PROMPT = PromptTemplate(
    input_variables=["description", "context"],
    template="""Analyze the following project description and extract key requirements:

Description: {description}
Context: {context}

Extract:
1. Project Type (web app, mobile app, API, etc.)
2. Key Features (list main functionalities)
3. Technical Requirements (preferred technologies, if mentioned)
4. Non-functional Requirements (performance, security, etc.)
5. Constraints (budget, timeline, team size, etc.)

Format the response as structured JSON."""
)

PROJECT_PLANNING_PROMPT = PromptTemplate(
    input_variables=["requirements", "constraints"],
    template="""Based on these requirements, create a project implementation plan:

Requirements: {requirements}
Constraints: {constraints}

Provide:
1. Recommended architecture
2. Technology stack
3. Component breakdown
4. Implementation phases
5. Potential challenges

Be specific and actionable."""
)

# Modification prompts
CHANGE_ANALYSIS_PROMPT = PromptTemplate(
    input_variables=["current_state", "requested_change"],
    template="""Analyze the impact of this change request:

Current Project State: {current_state}
Requested Change: {requested_change}

Determine:
1. Affected components
2. Implementation complexity (simple, moderate, complex)
3. Breaking changes
4. Required updates
5. Risk assessment

Provide a detailed analysis."""
)

# Clarification prompts
CLARIFICATION_PROMPT = PromptTemplate(
    input_variables=["context", "ambiguity"],
    template="""The user's request has some ambiguity. Generate clarifying questions:

Context: {context}
Ambiguous aspects: {ambiguity}

Generate 2-3 specific questions that would help clarify the requirements.
Make questions friendly and easy to understand."""
)

# Error handling prompts
ERROR_EXPLANATION_PROMPT = PromptTemplate(
    input_variables=["error", "context"],
    template="""Explain this technical error in user-friendly terms:

Error: {error}
Context: {context}

Provide:
1. What went wrong (in simple terms)
2. Why it might have happened
3. Suggested solutions
4. What to do next

Keep the explanation helpful and non-technical."""
)

# Domain Schema Extraction Prompts
DOMAIN_SCHEMA_PROMPT = PromptTemplate(
    input_variables=["project_description", "user_mode"],
    template="""Analyze the project description and extract domain schema with API specifications.

Project Description: {project_description}
User Mode: {user_mode}

Extract domain schema including:
1. **Entities/Models**: Core business objects with attributes
2. **Relationships**: How entities relate to each other  
3. **API Endpoints**: RESTful endpoints for CRUD operations
4. **Data Flow**: How data moves through the system

User Mode Guidelines:
- If user_mode is "beginner": Provide simple, essential entities only (3-5 main ones)
- If user_mode is "expert": Provide comprehensive schema with advanced relationships
- If user_mode is "admin": Include all technical details, security considerations, and optimization

Format as JSON:
{{
  "entities": [
    {{
      "name": "EntityName",
      "attributes": [
        {{"name": "field_name", "type": "string|number|boolean|date", "required": true|false, "description": "..."}}
      ],
      "relationships": [
        {{"type": "oneToMany|manyToOne|manyToMany", "target": "RelatedEntity", "description": "..."}}
      ]
    }}
  ],
  "api_endpoints": [
    {{
      "method": "GET|POST|PUT|DELETE",
      "path": "/api/resource",
      "description": "...",
      "request_body": {{}},
      "response": {{}}
    }}
  ],
  "complexity_level": "simple|moderate|complex"
}}"""
)

PROJECT_ARCHITECTURE_PROMPT = PromptTemplate(
    input_variables=["domain_schema", "user_mode", "project_type"],
    template="""Based on the domain schema, generate project architecture and implementation plan.

Domain Schema: {domain_schema}
User Mode: {user_mode}
Project Type: {project_type}

Generate architecture including:
1. **Technology Stack**: Recommended frameworks and tools
2. **Project Structure**: Folder organization and file structure
3. **Database Design**: Tables, indexes, relationships
4. **API Implementation**: Detailed endpoint implementations
5. **Frontend Components**: If applicable

User Mode Considerations:
- **Beginner**: Simple, proven technologies (Express.js, React, PostgreSQL)
- **Expert**: Modern stack with best practices (Next.js, Prisma, TypeScript)
- **Admin**: Enterprise-grade with scalability, security, monitoring

Provide step-by-step implementation guide."""
)


def get_conversation_system_prompt(user_mode: str = "beginner") -> str:
    """Get the main system prompt for conversations"""
    base_prompt = """You are GigaPress AI, an intelligent assistant that specializes in analyzing project requirements, extracting domain schemas, and generating API specifications.

Core Responsibilities:
1. **Domain Analysis**: Extract key business entities and relationships from project descriptions
2. **Schema Generation**: Create structured data models with proper relationships
3. **API Design**: Generate RESTful API endpoints with proper CRUD operations
4. **Architecture Planning**: Recommend technology stacks and project structure

Your Process:
1. Analyze the user's project description
2. Extract domain entities with attributes and relationships
3. Generate API endpoints for each entity
4. Provide implementation guidance based on user's experience level

Always respond in a structured format that can be easily parsed by the system."""

    mode_specific = {
        "beginner": """
User Mode: BEGINNER
- Focus on essential entities only (3-5 main ones)
- Use simple, proven technologies (Express.js, React, PostgreSQL)
- Provide basic CRUD operations
- Explain concepts in simple terms
- Avoid complex relationships and advanced features""",
        
        "expert": """
User Mode: EXPERT  
- Provide comprehensive schema with advanced relationships
- Recommend modern stack (Next.js, Prisma, TypeScript)
- Include advanced API features (pagination, filtering, caching)
- Consider performance and scalability
- Suggest best practices and design patterns""",
        
        "admin": """
User Mode: ADMIN
- Include all technical details and security considerations
- Enterprise-grade architecture with monitoring and observability
- Advanced features (rate limiting, authentication, authorization)
- Scalability and performance optimization
- Infrastructure and deployment considerations
- Security best practices and compliance"""
    }
    
    return base_prompt + mode_specific.get(user_mode, mode_specific["beginner"])


def get_project_types() -> Dict[str, str]:
    """Get supported project types with descriptions"""
    return {
        "web_app": "Full-stack web application with frontend and backend",
        "mobile_app": "Mobile application for iOS/Android",
        "api": "RESTful or GraphQL API service",
        "microservice": "Containerized microservice",
        "desktop_app": "Desktop application using Electron or similar",
        "cli_tool": "Command-line interface tool",
        "library": "Reusable software library or package"
    }
