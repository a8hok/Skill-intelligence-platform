USE skill_intelligence;

CREATE TABLE IF NOT EXISTS learning_roadmaps (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  assessment_id BIGINT NOT NULL,
  attempt_id INT NOT NULL,
  topic VARCHAR(80) NOT NULL,
  score INT NOT NULL,
  source_mode VARCHAR(20) NOT NULL DEFAULT 'gemini',
  version_no INT NOT NULL,
  summary TEXT NULL,
  strengths JSON NULL,
  gaps JSON NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_roadmap_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_roadmap_assessment FOREIGN KEY (assessment_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_roadmap_attempt FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
  KEY idx_roadmap_user_topic (user_id, topic),
  KEY idx_roadmap_status (status)
);

CREATE TABLE IF NOT EXISTS roadmap_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  roadmap_id BIGINT NOT NULL,
  sequence_no INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  concept VARCHAR(120) NULL,
  completed TINYINT(1) NOT NULL DEFAULT 0,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_roadmap_item FOREIGN KEY (roadmap_id) REFERENCES learning_roadmaps(id) ON DELETE CASCADE,
  UNIQUE KEY uq_roadmap_sequence (roadmap_id, sequence_no)
);
