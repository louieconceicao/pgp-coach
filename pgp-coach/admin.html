CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(20) DEFAULT 'purple',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  manager_name VARCHAR(255),
  start_date DATE,
  context_notes TEXT,
  pin VARCHAR(6) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'not_started',
  created_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hire_tags (
  hire_id UUID REFERENCES hires(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (hire_id, tag_id)
);

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hire_id UUID REFERENCES hires(id) ON DELETE CASCADE,
  module_key VARCHAR(50) NOT NULL,
  module_index INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'locked',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(hire_id, module_key)
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hire_id UUID REFERENCES hires(id) ON DELETE CASCADE,
  module_key VARCHAR(50) NOT NULL,
  role VARCHAR(10) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hire_id UUID REFERENCES hires(id) ON DELETE CASCADE UNIQUE,
  content TEXT NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Default admin: email=admin@teamrevenue.com password=admin123
INSERT INTO admins (email, password_hash, name)
VALUES ('admin@teamrevenue.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin')
ON CONFLICT DO NOTHING;
