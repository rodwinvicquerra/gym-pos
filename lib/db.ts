import { sql } from '@neondatabase/serverless';

// Get database connection
export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  return sql;
}

// Types
export interface Staff {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'staff';
  created_at: string;
}

export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  membership_type: 'monthly' | 'quarterly' | 'yearly' | 'none';
  membership_start_date: string | null;
  membership_end_date: string | null;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

export interface Membership {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  description: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  member_id: string | null;
  type: 'membership' | 'walk_in' | 'product';
  amount: number;
  payment_method: 'cash';
  description: string;
  staff_id: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  member_id: string;
  check_in_time: string;
  check_out_time: string | null;
  created_at: string;
}

export interface WalkIn {
  id: string;
  name: string;
  phone: string | null;
  check_in_time: string;
  check_out_time: string | null;
  fee: number;
  staff_id: string;
  created_at: string;
}
