ALTER TABLE problems
    ADD COLUMN slug VARCHAR(128);

UPDATE problems
SET slug = CONCAT('problem-', id)
WHERE slug IS NULL;

ALTER TABLE problems
    ALTER COLUMN slug SET NOT NULL;

ALTER TABLE problems
    ADD CONSTRAINT uq_problems_slug UNIQUE (slug);

