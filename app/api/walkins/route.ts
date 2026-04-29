import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM walkins
      ORDER BY check_in_time DESC
      LIMIT 100
    `;

    return NextResponse.json({
      walkins: result.rows,
    });
  } catch (error) {
    console.error('Error fetching walk-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch walk-ins' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, fee, staff_id, action } = await request.json();

    if (!name || !fee || !staff_id) {
      return NextResponse.json(
        { error: 'Name, fee, and staff_id are required' },
        { status: 400 }
      );
    }

    if (action === 'check_in') {
      const id = uuidv4();
      const now = new Date().toISOString();

      const result = await sql`
        INSERT INTO walkins (id, name, phone, check_in_time, fee, staff_id, created_at)
        VALUES (${id}, ${name}, ${phone || null}, ${now}, ${fee}, ${staff_id}, ${now})
        RETURNING *
      `;

      return NextResponse.json({
        walkin: result.rows[0],
      });
    } else if (action === 'check_out') {
      const { id } = await request.json();
      const now = new Date().toISOString();

      const result = await sql`
        UPDATE walkins
        SET check_out_time = ${now}
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Walk-in not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        walkin: result.rows[0],
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing walk-in:', error);
    return NextResponse.json(
      { error: 'Failed to process walk-in' },
      { status: 500 }
    );
  }
}
