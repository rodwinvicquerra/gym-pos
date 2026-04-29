import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('member_id');

    let query = sql`
      SELECT t.*, m.first_name, m.last_name
      FROM transactions t
      LEFT JOIN members m ON t.member_id = m.id
    `;

    if (memberId) {
      query = sql`
        SELECT t.*, m.first_name, m.last_name
        FROM transactions t
        LEFT JOIN members m ON t.member_id = m.id
        WHERE t.member_id = ${memberId}
      `;
    }

    const result = await sql`${query} ORDER BY t.created_at DESC`;

    return NextResponse.json({
      transactions: result.rows,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { member_id, type, amount, description, staff_id } =
      await request.json();

    if (!type || !amount || !staff_id) {
      return NextResponse.json(
        { error: 'Type, amount, and staff_id are required' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const result = await sql`
      INSERT INTO transactions (
        id, member_id, type, amount, payment_method, description, staff_id, created_at
      ) VALUES (
        ${id}, ${member_id || null}, ${type}, ${amount}, 'cash', ${description || null}, ${staff_id}, ${now}
      )
      RETURNING *
    `;

    return NextResponse.json({
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
