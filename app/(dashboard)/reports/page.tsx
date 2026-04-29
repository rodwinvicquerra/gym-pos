'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReportsPage() {
  const { data: dashboardData } = useSWR('/api/dashboard', fetcher, {
    refreshInterval: 30000,
  });
  const { data: transactionsData } = useSWR('/api/transactions', fetcher);
  const { data: membersData } = useSWR('/api/members', fetcher);
  const { data: checkinsData } = useSWR('/api/checkins', fetcher);

  const transactions = transactionsData?.transactions || [];
  const members = membersData?.members || [];
  const checkins = checkinsData?.checkins || [];
  const stats = dashboardData?.stats || {};

  // Calculate daily revenue
  const today = new Date();
  const dailyTransactions = transactions.filter((t: any) => {
    const tDate = new Date(t.created_at);
    return tDate.toDateString() === today.toDateString();
  });

  // Member stats
  const activeMembersCount = members.filter((m: any) => m.status === 'active').length;
  const inactiveMembersCount = members.filter((m: any) => m.status === 'inactive').length;

  // Membership breakdown
  const membershipStats = {
    monthly: members.filter((m: any) => m.membership_type === 'monthly').length,
    quarterly: members.filter((m: any) => m.membership_type === 'quarterly').length,
    yearly: members.filter((m: any) => m.membership_type === 'yearly').length,
    none: members.filter((m: any) => m.membership_type === 'none').length,
  };

  // Transaction breakdown
  const transactionByType = {
    membership: transactions.filter((t: any) => t.type === 'membership').length,
    walk_in: transactions.filter((t: any) => t.type === 'walk_in').length,
    product: transactions.filter((t: any) => t.type === 'product').length,
  };

  const data = [
    { name: 'Active', value: activeMembersCount },
    { name: 'Inactive', value: inactiveMembersCount },
  ];

  const membershipData = [
    { name: 'Monthly', members: membershipStats.monthly },
    { name: 'Quarterly', members: membershipStats.quarterly },
    { name: 'Yearly', members: membershipStats.yearly },
    { name: 'No Membership', members: membershipStats.none },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-2">View gym performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeMembersCount} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dailyTransactions.length} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{checkins.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.todayCheckins || 0} today
            </p>
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
              ₱{(stats.todayRevenue || 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dailyTransactions.length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Member Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membership Types Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={membershipData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="members" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Membership Sales</div>
              <div className="text-2xl font-bold mt-2">
                {transactionByType.membership}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Walk-in Transactions</div>
              <div className="text-2xl font-bold mt-2">
                {transactionByType.walk_in}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Product Sales</div>
              <div className="text-2xl font-bold mt-2">
                {transactionByType.product}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline">
            Export to CSV
          </Button>
          <Button variant="outline">
            Print Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
