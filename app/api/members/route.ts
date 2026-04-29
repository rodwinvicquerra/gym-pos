import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const result = await sql`
      SELECT id, first_name, last_name, email, phone, membership_type, 
             membership_end_date, status, created_at
      FROM members
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      members: result.rows,
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      date_of_birth,
      membership_type,
    } = await request.json();

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    let membershipStartDate = null;
    let membershipEndDate = null;

    if (membership_type && membership_type !== 'none') {
      membershipStartDate = now;
      // Calculate end date based on membership type
      const date = new Date();
      const months =
        membership_type === 'monthly'
          ? 1
          : membership_type === 'quarterly'
            ? 3
            : membership_type === 'yearly'
              ? 12
              : 1;
      date.setMonth(date.getMonth() + months);
      membershipEndDate = date.toISOString();
    }

    const result = await sql`
      INSERT INTO members (
        id, first_name, last_name, email, phone, address, date_of_birth,
        membership_type, membership_start_date, membership_end_date, status, created_at
      ) VALUES (
        ${id}, ${first_name}, ${last_name}, ${email}, ${phone || null}, 
        ${address || null}, ${date_of_birth || null}, ${membership_type || 'none'},
        ${membershipStartDate}, ${membershipEndDate}, 'active', ${now}
      )
      RETURNING *
    `;

    return NextResponse.json({
      member: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
  }
}
