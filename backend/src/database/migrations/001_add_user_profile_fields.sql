-- Migration: Add user profile fields
-- Description: Add age, profession, interests, country, and newsletter fields to users table

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS profession VARCHAR(100),
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS newsletter BOOLEAN DEFAULT FALSE;

-- Update existing users to have default values
UPDATE users 
SET newsletter = FALSE 
WHERE newsletter IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.age IS 'User age (13-120)';
COMMENT ON COLUMN users.profession IS 'User profession or job title';
COMMENT ON COLUMN users.interests IS 'Array of user interests/topics';
COMMENT ON COLUMN users.country IS 'User country of residence';
COMMENT ON COLUMN users.newsletter IS 'Whether user subscribed to newsletter';

-- Create index on age for potential age-based queries
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);

-- Create index on profession for potential profession-based queries  
CREATE INDEX IF NOT EXISTS idx_users_profession ON users(profession);

-- Create index on country for potential location-based queries
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
