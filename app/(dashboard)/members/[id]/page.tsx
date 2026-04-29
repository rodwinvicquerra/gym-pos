'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const { data, error, isLoading, mutate } = useSWR(
    `/api/members/${memberId}`,
    fetcher
  );
  const { data: transactionsData } = useSWR(
    `/api/transactions?member_id=${memberId}`,
    fetcher
  );
  const { data: checkinsData } = useSWR(
    `/api/checkins?member_id=${memberId}`,
    fetcher
  );

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const member = data?.member;
  const transactions = transactionsData?.transactions || [];
  const checkins = checkinsData?.checkins || [];

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone,
        address: member.address,
        date_of_birth: member.date_of_birth,
        membership_type: member.membership_type,
        status: member.status,
      });
    }
  }, [member]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update member');
      }

      mutate();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>Failed to load member</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!member) return <div>Member not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {member.first_name} {member.last_name}
          </h1>
          <p className="text-muted-foreground mt-2">{member.email}</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'outline' : 'default'}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        First Name
                      </label>
                      <Input
                        name="first_name"
                        value={formData?.first_name || ''}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Last Name
                      </label>
                      <Input
                        name="last_name"
                        value={formData?.last_name || ''}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        name="email"
                        value={formData?.email || ''}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <Input
                        name="phone"
                        value={formData?.phone || ''}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Address
                    </label>
                    <Input
                      name="address"
                      value={formData?.address || ''}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Date of Birth
                      </label>
                      <Input
                        type="date"
                        name="date_of_birth"
                        value={formData?.date_of_birth || ''}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData?.status || 'active'}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{member.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{member.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{member.address || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="font-medium">
                        {member.date_of_birth
                          ? new Date(member.date_of_birth).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{member.status}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Membership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">
                  {member.membership_type}
                </p>
              </div>
              {member.membership_end_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="font-medium">
                    {new Date(member.membership_end_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              <Button className="w-full">Renew Membership</Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Check-ins</span>
                <span className="font-medium">{checkins.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Payments</span>
                <span className="font-medium">
                  ₱
                  {transactions
                    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)
                    .toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-left py-2 px-2">Description</th>
                  <th className="text-left py-2 px-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction: any) => (
                  <tr key={transaction.id} className="border-b">
                    <td className="py-2 px-2 text-xs">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2 capitalize">{transaction.type}</td>
                    <td className="py-2 px-2">
                      {transaction.description || '-'}
                    </td>
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

      <Card>
        <CardHeader>
          <CardTitle>Check-in History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Check-in Time</th>
                  <th className="text-left py-2 px-2">Check-out Time</th>
                  <th className="text-left py-2 px-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                {checkins.slice(0, 10).map((checkin: any) => {
                  const checkInTime = new Date(checkin.check_in_time);
                  const checkOutTime = checkin.check_out_time
                    ? new Date(checkin.check_out_time)
                    : null;
                  const duration = checkOutTime
                    ? Math.round(
                        (checkOutTime.getTime() - checkInTime.getTime()) / 60000
                      )
                    : null;

                  return (
                    <tr key={checkin.id} className="border-b">
                      <td className="py-2 px-2 text-xs">
                        {checkInTime.toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2 text-xs">
                        {checkInTime.toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-2 text-xs">
                        {checkOutTime
                          ? checkOutTime.toLocaleTimeString()
                          : 'Active'}
                      </td>
                      <td className="py-2 px-2 text-xs">
                        {duration ? `${duration} min` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
