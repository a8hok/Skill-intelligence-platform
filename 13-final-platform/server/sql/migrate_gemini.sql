USE skill_intelligence;

CREATE TABLE IF NOT EXISTS assessment_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  topic VARCHAR(80) NOT NULL,
  questions JSON NOT NULL,
  model_name VARCHAR(80) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP NULL,
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SET @sql = IF(
  EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'assessment_sessions' AND index_name = 'idx_session_user'),
  'SELECT 1',
  'CREATE INDEX idx_session_user ON assessment_sessions(user_id)'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'assessment_sessions' AND index_name = 'idx_session_topic'),
  'SELECT 1',
  'CREATE INDEX idx_session_topic ON assessment_sessions(topic)'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
