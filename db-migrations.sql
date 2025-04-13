-- Alter flight_plans table to add new columns
ALTER TABLE flight_plans
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Basic',
ADD COLUMN IF NOT EXISTS path JSONB,
ADD COLUMN IF NOT EXISTS pilot_location JSONB,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Create flight_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS flight_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  flight_plan_id INTEGER REFERENCES flight_plans(id),
  aircraft_id INTEGER NOT NULL REFERENCES aircraft(id),
  pilot_name TEXT NOT NULL,
  observers JSONB,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration INTEGER,
  weather_conditions TEXT,
  flight_track JSONB,
  notes TEXT,
  attachments JSONB,
  created_at TEXT NOT NULL DEFAULT now(),
  updated_at TEXT NOT NULL DEFAULT now()
);