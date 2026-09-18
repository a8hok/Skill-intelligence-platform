USE skill_intelligence;

ALTER TABLE users
  MODIFY password_hash VARCHAR(255) NULL,
  ADD COLUMN external_uuid VARCHAR(80) NULL AFTER password_hash,
  ADD COLUMN avatar_url VARCHAR(500) NULL AFTER external_uuid,
  ADD COLUMN city VARCHAR(120) NULL AFTER avatar_url,
  ADD COLUMN country VARCHAR(120) NULL AFTER city;
