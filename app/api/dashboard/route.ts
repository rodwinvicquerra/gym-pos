import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Total members
    const membersResult = await sql`
      SELECT COUNT(*) as count FROM members WHERE status = 'active'
    `;

    // Today's check-ins
    const checkinResult = await sql`
      SELECT COUNT(*) as count FROM checkins 
      WHERE DATE(check_in_time) = DATE(${todayISO})
    `;

    // Today's transactions
    const transactionsResult = await sql`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
      FROM transactions 
      WHERE DATE(created_at) = DATE(${todayISO})
    `;

    // Today's walk-ins
    const walkinsResult = await sql`
      SELECT COUNT(*) as count, COALESCE(SUM(fee), 0) as total
      FROM walkins 
      WHERE DATE(check_in_time) = DATE(${todayISO})
    `;

    // Recent transactions
    const recentResult = await sql`
      SELECT t.*, m.first_name, m.last_name
      FROM transactions t
      LEFT JOIN members m ON t.member_id = m.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      stats: {
        activeMembers: membersResult.rows[0].count,
        todayCheckins: checkinResult.rows[0].count,
        todayTransactions: transactionsResult.rows[0].count,
        todayRevenue: parseFloat(transactionsResult.rows[0].total),
        todayWalkins: walkinsResult.rows[0].count,
        walkinsRevenue: parseFloat(walkinsResult.rows[0].total),
      },
      recentTransactions: recentResult.rows,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
