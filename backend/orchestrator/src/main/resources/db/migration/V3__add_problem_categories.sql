ALTER TABLE problems
    ADD COLUMN categories JSONB;

UPDATE problems SET categories = '[]'::jsonb WHERE categories IS NULL;

