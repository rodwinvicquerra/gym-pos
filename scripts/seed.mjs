import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runSchema() {
  console.log('Creating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS staff (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'staff',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id UUID PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20),
      address TEXT,
      date_of_birth DATE,
      membership_type VARCHAR(50) DEFAULT 'none',
      membership_start_date TIMESTAMP,
      membership_end_date TIMESTAMP,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS checkins (
      id UUID PRIMARY KEY,
      member_id UUID NOT NULL REFERENCES members(id),
      check_in_time TIMESTAMP NOT NULL,
      check_out_time TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS walkins (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      check_in_time TIMESTAMP NOT NULL,
      check_out_time TIMESTAMP,
      fee DECIMAL(10, 2) NOT NULL,
      staff_id UUID NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY,
      member_id UUID REFERENCES members(id),
      type VARCHAR(50) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'cash',
      description TEXT,
      staff_id UUID NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  console.log('Tables created successfully.');
}

async function seedAdmin() {
  console.log('Seeding default admin user...');
  const passwordHash = await bcrypt.hash('admin123', 10);

  await sql`
    INSERT INTO staff (email, password_hash, name, role)
    VALUES ('admin@gym.com', ${passwordHash}, 'Administrator', 'admin')
    ON CONFLICT (email) DO NOTHING
  `;

  console.log('Admin user ready: admin@gym.com / admin123');
}

async function main() {
  try {
    await runSchema();
    await seedAdmin();
    console.log('Database setup complete!');
  } catch (err) {
    console.error('Error during setup:', err);
    process.exit(1);
  }
}

main();
