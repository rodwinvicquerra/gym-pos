'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR('/api/dashboard', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30000,
  });

  if (error) return <div>Failed to load dashboard</div>;
  if (isLoading) return <div>Loading...</div>;

  const stats = data?.stats || {};
  const recentTransactions = data?.recentTransactions || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to the Gym POS System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeMembers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayCheckins || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₱{(stats.todayRevenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Walk-ins Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayWalkins || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/members/new">
          <Button className="w-full">Add Member</Button>
        </Link>
        <Link href="/checkin">
          <Button className="w-full" variant="outline">
            Quick Check-in
          </Button>
        </Link>
        <Link href="/walkins">
          <Button className="w-full" variant="outline">
            Walk-in Guest
          </Button>
        </Link>
        <Link href="/transactions">
          <Button className="w-full" variant="outline">
            New Transaction
          </Button>
        </Link>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Member</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-left py-2 px-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction: any) => (
                  <tr key={transaction.id} className="border-b hover:bg-accent">
                    <td className="py-2 px-2">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2">
                      {transaction.first_name
                        ? `${transaction.first_name} ${transaction.last_name}`
                        : 'Walk-in'}
                    </td>
                    <td className="py-2 px-2 capitalize">{transaction.type}</td>
                    <td className="py-2 px-2 font-semibold">
                      ₱{parseFloat(transaction.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
