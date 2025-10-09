-- Email Queue Table for reliable email delivery
CREATE TABLE IF NOT EXISTS email_queue (
    id SERIAL PRIMARY KEY,
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_text TEXT NOT NULL,
    body_html TEXT,
    cc_emails TEXT[], -- Array of CC emails
    bcc_emails TEXT[], -- Array of BCC emails
    attachments JSONB, -- JSON array of attachments
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, retrying
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_attempt TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_last_attempt ON email_queue(last_attempt);
CREATE INDEX IF NOT EXISTS idx_email_queue_to_email ON email_queue(to_email);

-- Email delivery logs for tracking
CREATE TABLE IF NOT EXISTS email_delivery_logs (
    id SERIAL PRIMARY KEY,
    email_queue_id INTEGER REFERENCES email_queue(id) ON DELETE CASCADE,
    message_id VARCHAR(255),
    status VARCHAR(50), -- sent, delivered, bounced, failed
    provider_response TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_queue_id ON email_delivery_logs(email_queue_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_status ON email_delivery_logs(status);
