-- Create the request_logs table for rate limiting
CREATE TABLE IF NOT EXISTS request_logs (
    id SERIAL PRIMARY KEY,
    ip_address TEXT NOT NULL,
    request_type TEXT DEFAULT 'code_analysis',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on ip_address and created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_request_logs_ip_time ON request_logs(ip_address, created_at);

-- Optional: Create a view to easily check current usage
CREATE OR REPLACE VIEW current_usage AS
SELECT 
    ip_address, 
    count(*) as request_count
FROM 
    request_logs
WHERE 
    created_at > NOW() - INTERVAL '10 minutes'
GROUP BY 
    ip_address;
