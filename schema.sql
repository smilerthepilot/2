CREATE TABLE IF NOT EXISTS tiles (
  id SERIAL PRIMARY KEY,
  aircraft VARCHAR(32) NOT NULL,
  takeoff VARCHAR(8) NOT NULL,
  landing VARCHAR(8) NOT NULL,
  captain VARCHAR(64),
  others VARCHAR(128),
  fuel VARCHAR(32),
  fti VARCHAR(64),
  notes TEXT
); 