import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('member_id');

    let result;

    if (memberId) {
      result = await sql`
        SELECT * FROM checkins
        WHERE member_id = ${memberId}
        ORDER BY check_in_time DESC
      `;
    } else {
      result = await sql`
        SELECT c.*, m.first_name, m.last_name
        FROM checkins c
        LEFT JOIN members m ON c.member_id = m.id
        ORDER BY c.check_in_time DESC
        LIMIT 50
      `;
    }

    return NextResponse.json({
      checkins: result.rows,
    });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { member_id, action } = await request.json();

    if (!member_id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    if (action === 'check_in') {
      const id = uuidv4();
      const now = new Date().toISOString();

      const result = await sql`
        INSERT INTO checkins (id, member_id, check_in_time, created_at)
        VALUES (${id}, ${member_id}, ${now}, ${now})
        RETURNING *
      `;

      return NextResponse.json({
        checkin: result.rows[0],
      });
    } else if (action === 'check_out') {
      const now = new Date().toISOString();

      // Get the latest check-in without check-out
      const getLatest = await sql`
        SELECT id FROM checkins
        WHERE member_id = ${member_id} AND check_out_time IS NULL
        ORDER BY check_in_time DESC
        LIMIT 1
      `;

      if (getLatest.rows.length === 0) {
        return NextResponse.json(
          { error: 'No active check-in found' },
          { status: 400 }
        );
      }

      const result = await sql`
        UPDATE checkins
        SET check_out_time = ${now}
        WHERE id = ${getLatest.rows[0].id}
        RETURNING *
      `;

      return NextResponse.json({
        checkin: result.rows[0],
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing check-in:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
}
