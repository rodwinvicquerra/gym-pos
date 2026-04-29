import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@neondatabase/serverless';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sql`
      SELECT * FROM members WHERE id = ${params.id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      member: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      date_of_birth,
      membership_type,
      status,
    } = await request.json();

    const result = await sql`
      UPDATE members
      SET first_name = ${first_name},
          last_name = ${last_name},
          email = ${email},
          phone = ${phone || null},
          address = ${address || null},
          date_of_birth = ${date_of_birth || null},
          membership_type = ${membership_type},
          status = ${status}
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      member: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}
