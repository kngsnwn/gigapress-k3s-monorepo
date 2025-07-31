-- Chat Sessions Table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(255),
    project_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message_id VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    model_name VARCHAR(255),
    sequence_number BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'error', 'received')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for better query performance
CREATE INDEX idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_project_id ON chat_sessions(project_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_message_id ON chat_messages(message_id);
CREATE INDEX idx_chat_messages_sequence ON chat_messages(session_id, sequence_number);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);

-- Sequence for ensuring message ordering
CREATE SEQUENCE chat_message_sequence_seq START WITH 1 INCREMENT BY 1;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON chat_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for chat messages with session info
CREATE VIEW chat_messages_with_session AS
SELECT 
    m.id,
    m.message_id,
    m.role,
    m.content,
    m.model_name,
    m.sequence_number,
    m.created_at,
    m.status,
    m.metadata as message_metadata,
    s.session_id,
    s.user_id,
    s.project_id,
    s.metadata as session_metadata
FROM chat_messages m
JOIN chat_sessions s ON m.session_id = s.id
ORDER BY m.session_id, m.sequence_number;