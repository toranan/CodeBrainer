ALTER TABLE problems
    ADD COLUMN languages JSONB,
    ADD COLUMN constraints TEXT;

UPDATE problems
SET languages = '[]'::jsonb
WHERE languages IS NULL;

