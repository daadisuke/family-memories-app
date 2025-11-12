-- Migration: Add created_by column to families table
-- Date: 2025-11-12
-- Description: Add created_by column to track who created each family group

-- Add created_by column
ALTER TABLE families
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_families_created_by ON families(created_by);

-- Add comment
COMMENT ON COLUMN families.created_by IS 'ID of the user who created the family group';
