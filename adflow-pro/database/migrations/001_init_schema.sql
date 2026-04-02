-- AdFlow Pro Database Schema
-- Complete schema with all tables, relationships, constraints, and indexes

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'moderator', 'admin', 'super_admin')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    profile_image_url TEXT,
    company_name VARCHAR(255),
    company_website TEXT,
    address TEXT,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    bio TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);


-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);


-- ============================================
-- 3. CITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    state_province VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, country)
);

CREATE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_cities_is_active ON cities(is_active);


-- ============================================
-- 4. PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    duration_days INTEGER NOT NULL DEFAULT 30,
    max_ads INTEGER,
    featured BOOLEAN DEFAULT FALSE,
    priority_rank INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_packages_slug ON packages(slug);
CREATE INDEX idx_packages_is_active ON packages(is_active);


-- ============================================
-- 5. ADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (
        status IN (
            'draft', 'submitted', 'under_review', 'rejected',
            'payment_pending', 'payment_submitted', 'verified',
            'published', 'expired', 'archived'
        )
    ),
    is_featured BOOLEAN DEFAULT FALSE,
    price DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    website_url TEXT,
    
    -- Approval/Rejection
    rejected_reason TEXT,
    rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejected_at TIMESTAMP WITH TIME ZONE,
    
    -- Publishing
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ads_user_id ON ads(user_id);
CREATE INDEX idx_ads_category_id ON ads(category_id);
CREATE INDEX idx_ads_city_id ON ads(city_id);
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_slug ON ads(slug);
CREATE INDEX idx_ads_published_at ON ads(published_at DESC);
CREATE INDEX idx_ads_expires_at ON ads(expires_at);
CREATE INDEX idx_ads_is_featured ON ads(is_featured);


-- ============================================
-- 6. AD_MEDIA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ad_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video', 'youtube')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    title VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    flagged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    flagged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ad_media_ad_id ON ad_media(ad_id);
CREATE INDEX idx_ad_media_is_flagged ON ad_media(is_flagged);


-- ============================================
-- 7. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'submitted', 'verified', 'rejected', 'refunded')
    ),
    
    -- Payment proof
    proof_url TEXT,
    proof_type VARCHAR(50) CHECK (proof_type IN ('screenshot', 'invoice', 'receipt')),
    
    -- Verification
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    rejection_reason TEXT,
    rejected_at TIMESTAMP WITH TIME ZONE,
    
    -- Transaction details
    transaction_id VARCHAR(255),
    payment_method VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_ad_id ON payments(ad_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE UNIQUE INDEX idx_payments_ad_unique ON payments(ad_id) WHERE status IN ('verified', 'submitted');


-- ============================================
-- 8. AD_STATUS_HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ad_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ad_status_history_ad_id ON ad_status_history(ad_id);
CREATE INDEX idx_ad_status_history_created_at ON ad_status_history(created_at DESC);


-- ============================================
-- 9. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);


-- ============================================
-- 10. AUDIT_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);


-- ============================================
-- 11. ANALYTICS_SNAPSHOT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL,
    total_ads INTEGER,
    active_ads INTEGER,
    total_revenue DECIMAL(15, 2),
    ads_by_category JSONB,
    ads_by_city JSONB,
    approval_rate DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date)
);

CREATE INDEX idx_analytics_snapshot_date ON analytics_snapshots(snapshot_date DESC);


-- ============================================
-- 12. SYSTEM_HEALTH_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('healthy', 'warning', 'error')),
    message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_health_logs_created_at ON system_health_logs(created_at DESC);
CREATE INDEX idx_system_health_logs_service_name ON system_health_logs(service_name);


-- ============================================
-- STORED PROCEDURES & FUNCTIONS
-- ============================================

-- Function to calculate ad rank score
CREATE OR REPLACE FUNCTION calculate_ad_rank_score(
    p_ad_id UUID,
    p_featured INTEGER DEFAULT 0,
    p_package_weight INTEGER DEFAULT 100,
    p_admin_boost INTEGER DEFAULT 0
) RETURNS INTEGER AS $$
DECLARE
    v_freshness_score INTEGER;
    v_rank_score INTEGER;
    v_published_date TIMESTAMP;
BEGIN
    -- Get published date
    SELECT published_at INTO v_published_date FROM ads WHERE id = p_ad_id;
    
    -- Calculate freshness (recent = higher score)
    v_freshness_score := GREATEST(0, 100 - (EXTRACT(DAY FROM NOW() - v_published_date) * 2))::INTEGER;
    
    -- Calculate total rank
    v_rank_score := (p_featured * 50) + p_package_weight + v_freshness_score + p_admin_boost;
    
    RETURN v_rank_score;
END;
$$ LANGUAGE plpgsql;


-- Function to auto-expire ads
CREATE OR REPLACE FUNCTION auto_expire_ads() RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE ads 
    SET status = 'expired', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'published' AND expires_at <= NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;


-- Trigger to update ad timestamp
CREATE OR REPLACE FUNCTION update_ad_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ads_updated_at
BEFORE UPDATE ON ads
FOR EACH ROW
EXECUTE FUNCTION update_ad_updated_at();


-- Trigger to log ad status changes
CREATE OR REPLACE FUNCTION log_ad_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status <> OLD.status THEN
        INSERT INTO ad_status_history (ad_id, changed_by, old_status, new_status, created_at)
        VALUES (NEW.id, COALESCE(current_user_id(), NULL), OLD.status, NEW.status, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ad_status_history
AFTER UPDATE ON ads
FOR EACH ROW
EXECUTE FUNCTION log_ad_status_change();


-- ============================================
-- INITIAL DATA: CATEGORIES
-- ============================================
INSERT INTO categories (name, slug, description, sort_order) VALUES
    ('Real Estate', 'real-estate', 'Property listings and real estate services', 1),
    ('Jobs', 'jobs', 'Job postings and employment opportunities', 2),
    ('Services', 'services', 'Professional and personal services', 3),
    ('Business', 'business', 'Business opportunities and partnerships', 4),
    ('Education', 'education', 'Educational courses and training', 5),
    ('Travel', 'travel', 'Travel packages and tours', 6),
    ('Health & Wellness', 'health-wellness', 'Health and wellness services', 7),
    ('Technology', 'technology', 'Tech products and services', 8),
    ('Automotive', 'automotive', 'Vehicles and automotive services', 9),
    ('Fashion & Beauty', 'fashion-beauty', 'Fashion and beauty products', 10)
ON CONFLICT DO NOTHING;


-- ============================================
-- INITIAL DATA: CITIES
-- ============================================
INSERT INTO cities (name, slug, country, state_province, sort_order) VALUES
    ('Karachi', 'karachi', 'Pakistan', 'Sindh', 1),
    ('Lahore', 'lahore', 'Pakistan', 'Punjab', 2),
    ('Islamabad', 'islamabad', 'Pakistan', 'Federal', 3),
    ('Rawalpindi', 'rawalpindi', 'Pakistan', 'Punjab', 4),
    ('Peshawar', 'peshawar', 'Pakistan', 'KPK', 5),
    ('Quetta', 'quetta', 'Pakistan', 'Balochistan', 6),
    ('Faisalabad', 'faisalabad', 'Pakistan', 'Punjab', 7),
    ('Multan', 'multan', 'Pakistan', 'Punjab', 8),
    ('Hyderabad', 'hyderabad', 'Pakistan', 'Sindh', 9),
    ('Gujranwala', 'gujranwala', 'Pakistan', 'Punjab', 10)
ON CONFLICT DO NOTHING;


-- ============================================
-- INITIAL DATA: PACKAGES
-- ============================================
INSERT INTO packages (name, slug, description, price, duration_days, max_ads, featured, priority_rank, is_active) VALUES
    ('Basic', 'basic', 'Perfect for getting started', 9.99, 30, 1, FALSE, 100, TRUE),
    ('Professional', 'professional', 'For serious sellers', 24.99, 30, 3, FALSE, 75, TRUE),
    ('Premium', 'premium', 'Maximum exposure', 49.99, 30, 5, TRUE, 50, TRUE),
    ('Enterprise', 'enterprise', 'Custom solutions', 99.99, 60, 10, TRUE, 25, TRUE)
ON CONFLICT (slug) DO NOTHING;


-- ============================================
-- VIEW: Active Ads View
-- ============================================
CREATE OR REPLACE VIEW active_ads_view AS
SELECT 
    a.id,
    a.user_id,
    a.title,
    a.slug,
    a.description,
    a.price,
    a.status,
    a.is_featured,
    a.published_at,
    a.expires_at,
    c.name as category_name,
    cy.name as city_name,
    u.first_name,
    u.last_name,
    u.company_name,
    COALESCE(calculate_ad_rank_score(a.id, a.is_featured::INTEGER, 100, 0), 0) as rank_score
FROM ads a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN cities cy ON a.city_id = cy.id
LEFT JOIN users u ON a.user_id = u.id
WHERE a.status = 'published' 
    AND a.published_at <= NOW() 
    AND (a.expires_at IS NULL OR a.expires_at > NOW())
ORDER BY a.is_featured DESC, a.published_at DESC;


-- ============================================
-- VIEW: Payment Queue View
-- ============================================
CREATE OR REPLACE VIEW payment_queue_view AS
SELECT 
    p.id,
    p.ad_id,
    a.title,
    u.email,
    u.first_name,
    u.last_name,
    p.amount,
    p.currency,
    p.status,
    p.proof_url,
    p.created_at,
    pkg.name as package_name
FROM payments p
JOIN ads a ON p.ad_id = a.id
JOIN users u ON p.user_id = u.id
JOIN packages pkg ON p.package_id = pkg.id
WHERE p.status IN ('submitted', 'pending')
ORDER BY p.created_at ASC;


-- ============================================
-- VIEW: Review Queue View
-- ============================================
CREATE OR REPLACE VIEW review_queue_view AS
SELECT 
    a.id,
    a.title,
    a.slug,
    a.description,
    a.status,
    u.email,
    u.first_name,
    u.last_name,
    c.name as category_name,
    cy.name as city_name,
    a.submitted_at,
    a.created_at,
    COUNT(am.id) as media_count
FROM ads a
JOIN users u ON a.user_id = u.id
JOIN categories c ON a.category_id = c.id
JOIN cities cy ON a.city_id = cy.id
LEFT JOIN ad_media am ON a.id = am.ad_id
WHERE a.status IN ('submitted', 'under_review')
GROUP BY a.id, u.id, c.id, cy.id
ORDER BY a.submitted_at ASC;
