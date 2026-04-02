/**
 * Database Migration: Add CRON Job Tables and Functions
 * File: database/migrations/003_add_cron_tables.sql
 * 
 * This migration adds support for the CRON jobs system:
 * - cron_job_logs: tracks all cron job executions
 * - cron_health_logs: stores system health metrics
 * - Indexes for optimized queries
 * - Helper function for statistics
 * 
 * Run this via Supabase SQL Editor or your migration tool
 */

-- ===================================
-- TABLE 1: CRON JOB LOGS
-- ===================================
-- Tracks execution of all cron jobs with status and metadata

CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Job identification
  timestamp TIMESTAMPTZ NOT NULL,
  job_name VARCHAR(100) NOT NULL,
  
  -- Execution status
  status VARCHAR(50) NOT NULL,
  
  -- Additional data (stores JSON)
  -- Example: {"adsPublished": 15, "adsFailed": 2, "duration": 3500}
  metadata JSONB,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint to ensure valid status
  CONSTRAINT job_status_check CHECK (
    status IN ('started', 'completed', 'failed')
  )
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_job_name 
ON cron_job_logs(job_name);

CREATE INDEX IF NOT EXISTS idx_cron_job_logs_created_at 
ON cron_job_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cron_job_logs_status_date 
ON cron_job_logs(status, created_at DESC);

-- Enable RLS if needed
ALTER TABLE cron_job_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view logs (read-only)
CREATE POLICY "Allow authenticated users to view cron logs"
ON cron_job_logs FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow service role to insert logs (server-side only)
CREATE POLICY "Allow service role to insert cron logs"
ON cron_job_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE cron_job_logs IS 'Logs for all scheduled cron job executions with status and performance metrics';
COMMENT ON COLUMN cron_job_logs.job_name IS 'Name of the cron job (publishScheduledAds, expireAdsAutomatically, etc.)';
COMMENT ON COLUMN cron_job_logs.status IS 'Execution status: started, completed, or failed';
COMMENT ON COLUMN cron_job_logs.metadata IS 'JSON object containing job-specific metrics and results';

---

-- ===================================
-- TABLE 2: CRON HEALTH LOGS
-- ===================================
-- Periodic snapshots of system health metrics

CREATE TABLE IF NOT EXISTS cron_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Timestamp of the health check
  timestamp TIMESTAMPTZ NOT NULL,
  
  -- Server metrics
  uptime_seconds INTEGER,
  
  -- Memory metrics
  memory_heap_used_mb INTEGER,
  memory_heap_total_mb INTEGER,
  memory_heap_used_percent DECIMAL(5,2),
  
  -- Ad statistics
  ads_total INTEGER,
  ads_published INTEGER,
  ads_expired INTEGER,
  ads_draft INTEGER,
  
  -- User statistics
  users_total INTEGER,
  
  -- System info
  node_version VARCHAR(50),
  
  -- Health status
  status VARCHAR(20),
  
  -- Audit field
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cron_health_logs_timestamp 
ON cron_health_logs(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_cron_health_logs_status 
ON cron_health_logs(status);

CREATE INDEX IF NOT EXISTS idx_cron_health_logs_memory 
ON cron_health_logs(memory_heap_used_percent DESC);

-- Enable RLS if needed
ALTER TABLE cron_health_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view health logs (read-only)
CREATE POLICY "Allow authenticated users to view health logs"
ON cron_health_logs FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow service role to insert health logs
CREATE POLICY "Allow service role to insert health logs"
ON cron_health_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE cron_health_logs IS 'Hourly snapshots of system health metrics for monitoring and alerting';
COMMENT ON COLUMN cron_health_logs.timestamp IS 'When the health check was run';
COMMENT ON COLUMN cron_health_logs.memory_heap_used_percent IS 'Heap memory usage as percentage (0-100)';

---

-- ===================================
-- TABLE 3: AD_STATUS_HISTORY UPDATE
-- ===================================
-- This table might already exist, so we just ensure the structure

CREATE TABLE IF NOT EXISTS ad_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to ads table
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  
  -- Status transition details
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  reason TEXT,
  
  -- Who made the change (user or system)
  created_by VARCHAR(100),
  
  -- Audit field
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ad_status_history_ad_id 
ON ad_status_history(ad_id);

CREATE INDEX IF NOT EXISTS idx_ad_status_history_created_at 
ON ad_status_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ad_status_history_status 
ON ad_status_history(to_status);

COMMENT ON TABLE ad_status_history IS 'Audit trail of all ad status transitions for tracking and debugging';

---

-- ===================================
-- FUNCTION: GET_AD_STATISTICS
-- ===================================
-- Used by health check to get system statistics

CREATE OR REPLACE FUNCTION get_ad_statistics()
RETURNS TABLE (
  total_ads BIGINT,
  published_ads BIGINT,
  expired_ads BIGINT,
  draft_ads BIGINT,
  awaiting_payment_ads BIGINT,
  total_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM ads)::BIGINT,
    (SELECT COUNT(*) FROM ads WHERE status = 'published')::BIGINT,
    (SELECT COUNT(*) FROM ads WHERE status = 'expired')::BIGINT,
    (SELECT COUNT(*) FROM ads WHERE status = 'draft')::BIGINT,
    (SELECT COUNT(*) FROM ads WHERE status = 'awaiting_payment')::BIGINT,
    (SELECT COUNT(*) FROM users)::BIGINT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_ad_statistics IS 'Returns snapshot of system statistics for health monitoring';

---

-- ===================================
-- FUNCTION: GET_CRON_STATISTICS
-- ===================================
-- Returns statistics about cron jobs

CREATE OR REPLACE FUNCTION get_cron_statistics(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
  job_name VARCHAR,
  total_runs BIGINT,
  successful_runs BIGINT,
  failed_runs BIGINT,
  success_rate DECIMAL,
  avg_duration_ms NUMERIC,
  last_run TIMESTAMPTZ,
  last_status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_jobs AS (
    SELECT
      job_name,
      status,
      (metadata->>'duration')::INTEGER as duration,
      created_at
    FROM cron_job_logs
    WHERE created_at > NOW() - (hours_back::TEXT || ' hours')::INTERVAL
  )
  SELECT
    rj.job_name,
    COUNT(*)::BIGINT as total_runs,
    COUNT(*) FILTER (WHERE rj.status = 'completed')::BIGINT as successful_runs,
    COUNT(*) FILTER (WHERE rj.status = 'failed')::BIGINT as failed_runs,
    ROUND(
      COUNT(*) FILTER (WHERE rj.status = 'completed')::DECIMAL / NULLIF(COUNT(*)::DECIMAL, 0) * 100,
      2
    ) as success_rate,
    ROUND(AVG(CASE WHEN rj.duration IS NOT NULL THEN rj.duration ELSE 0 END)::NUMERIC, 2) as avg_duration_ms,
    MAX(rj.created_at) as last_run,
    (SELECT status FROM cron_job_logs c2 WHERE c2.job_name = rj.job_name ORDER BY created_at DESC LIMIT 1) as last_status
  FROM recent_jobs rj
  GROUP BY rj.job_name
  ORDER BY MAX(rj.created_at) DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_cron_statistics IS 'Returns statistics and health metrics for all cron jobs in the last N hours';

---

-- ===================================
-- FUNCTION: CLEANUP_OLD_LOGS
-- ===================================
-- Helper function to clean up old logs

CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS TABLE (
  cron_logs_deleted BIGINT,
  health_logs_deleted BIGINT
) AS $$
DECLARE
  v_cron_deleted BIGINT;
  v_health_deleted BIGINT;
BEGIN
  DELETE FROM cron_job_logs
  WHERE created_at < NOW() - (days_to_keep::TEXT || ' days')::INTERVAL;
  GET DIAGNOSTICS v_cron_deleted = ROW_COUNT;
  
  DELETE FROM cron_health_logs
  WHERE created_at < NOW() - (days_to_keep::TEXT || ' days')::INTERVAL;
  GET DIAGNOSTICS v_health_deleted = ROW_COUNT;
  
  RETURN QUERY SELECT v_cron_deleted, v_health_deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_logs IS 'Removes cron logs older than specified number of days to free up space';

---

-- ===================================
-- VIEWS FOR MONITORING
-- ===================================

-- View: Recent Cron Job Failures
CREATE OR REPLACE VIEW v_cron_recent_failures AS
SELECT
  job_name,
  COUNT(*) as failure_count,
  MAX(created_at) as last_failure,
  MAX(metadata->>'error') as last_error
FROM cron_job_logs
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY job_name
ORDER BY failure_count DESC;

COMMENT ON VIEW v_cron_recent_failures IS 'Shows recent cron job failures in last 24 hours';

-- View: System Health Warnings
CREATE OR REPLACE VIEW v_health_warnings AS
SELECT
  timestamp,
  uptime_seconds,
  memory_heap_used_percent,
  ads_total,
  CASE 
    WHEN memory_heap_used_percent > 90 THEN 'CRITICAL_MEMORY'
    WHEN memory_heap_used_percent > 80 THEN 'WARNING_MEMORY'
    ELSE 'OK'
  END as warning_type
FROM cron_health_logs
WHERE memory_heap_used_percent > 80
  AND timestamp > NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;

COMMENT ON VIEW v_health_warnings IS 'Shows all system health warnings (high memory usage) in last 7 days';

-- View: Ad Status Transitions Today
CREATE OR REPLACE VIEW v_ad_status_transitions_today AS
SELECT
  from_status,
  to_status,
  COUNT(*) as count,
  MAX(created_at) as last_transition
FROM ad_status_history
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY from_status, to_status
ORDER BY count DESC;

COMMENT ON VIEW v_ad_status_transitions_today IS 'Shows all ad status transitions that happened today';

---

-- ===================================
-- GRANTS & PERMISSIONS
-- ===================================

-- Grant read access to authenticated users for logs
GRANT SELECT ON cron_job_logs TO authenticated;
GRANT SELECT ON cron_health_logs TO authenticated;
GRANT SELECT ON ad_status_history TO authenticated;

-- Grant function access
GRANT EXECUTE ON FUNCTION get_ad_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION get_cron_statistics TO authenticated;

-- Grant view access
GRANT SELECT ON v_cron_recent_failures TO authenticated;
GRANT SELECT ON v_health_warnings TO authenticated;
GRANT SELECT ON v_ad_status_transitions_today TO authenticated;

---

-- ===================================
-- VERIFICATION QUERIES
-- ===================================
-- Run these to verify the migration completed successfully

/*
-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cron_job_logs', 'cron_health_logs', 'ad_status_history');

-- Verify indexes were created
SELECT tablename, indexname FROM pg_indexes 
WHERE tablename IN ('cron_job_logs', 'cron_health_logs', 'ad_status_history')
AND indexname LIKE 'idx_%';

-- Verify functions were created
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_ad_statistics', 'get_cron_statistics', 'cleanup_old_logs');

-- Verify views were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'VIEW' 
AND table_name LIKE 'v_%';
*/

---

-- ===================================
-- MIGRATION COMPLETE
-- ===================================

-- This migration adds:
-- ✅ cron_job_logs table with 3 indexes
-- ✅ cron_health_logs table with 3 indexes
-- ✅ ad_status_history table (if not exists) with 3 indexes
-- ✅ get_ad_statistics() function
-- ✅ get_cron_statistics() function
-- ✅ cleanup_old_logs() function
-- ✅ 3 monitoring views
-- ✅ RLS policies for security
-- ✅ Proper comments and documentation

-- Status: Ready for Production ✅
