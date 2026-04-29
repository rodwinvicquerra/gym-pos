'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WalkinsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    fee: '100',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { data, mutate } = useSWR('/api/walkins', fetcher, {
    refreshInterval: 5000,
  });

  const walkins = data?.walkins || [];
  const staffId = 'system'; // In a real app, this would come from the logged-in user

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/walkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fee: parseFloat(formData.fee),
          staff_id: staffId,
          action: 'check_in',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check in walk-in');
      }

      setFormData({ name: '', phone: '', fee: '100' });
      setMessage(`✓ ${formData.name} checked in successfully!`);
      mutate();

      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage('Failed to check in. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (id: string) => {
    setLoading(true);

    try {
      const response = await fetch('/api/walkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'check_out',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check out');
      }

      mutate();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const activeWalkins = walkins.filter((w: any) => !w.check_out_time);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Walk-in Guests</h1>
        <p className="text-muted-foreground mt-2">Manage walk-in guest check-ins</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Register Walk-in Guest</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Guest Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter guest name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Fee (₱)
                </label>
                <Input
                  type="number"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-md ${
                  message.startsWith('✓')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {message}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Checking in...' : 'Check In Guest'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Active Guests ({activeWalkins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeWalkins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active walk-in guests
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Phone</th>
                    <th className="text-left py-2 px-2">Check-in Time</th>
                    <th className="text-left py-2 px-2">Fee</th>
                    <th className="text-left py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeWalkins.map((walkin: any) => (
                    <tr key={walkin.id} className="border-b hover:bg-accent">
                      <td className="py-2 px-2 font-medium">{walkin.name}</td>
                      <td className="py-2 px-2">{walkin.phone || 'N/A'}</td>
                      <td className="py-2 px-2">
                        {new Date(walkin.check_in_time).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-2 font-semibold">
                        ₱{parseFloat(walkin.fee).toFixed(2)}
                      </td>
                      <td className="py-2 px-2">
                        <Button
                          onClick={() => handleCheckOut(walkin.id)}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                        >
                          Check Out
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Walk-in Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-left py-2 px-2">Phone</th>
                  <th className="text-left py-2 px-2">Check-in</th>
                  <th className="text-left py-2 px-2">Check-out</th>
                  <th className="text-left py-2 px-2">Fee</th>
                </tr>
              </thead>
              <tbody>
                {walkins.slice(0, 20).map((walkin: any) => (
                  <tr key={walkin.id} className="border-b">
                    <td className="py-2 px-2">{walkin.name}</td>
                    <td className="py-2 px-2">{walkin.phone || 'N/A'}</td>
                    <td className="py-2 px-2 text-xs">
                      {new Date(walkin.check_in_time).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-2 text-xs">
                      {walkin.check_out_time
                        ? new Date(walkin.check_out_time).toLocaleTimeString()
                        : 'Active'}
                    </td>
                    <td className="py-2 px-2">₱{parseFloat(walkin.fee).toFixed(2)}</td>
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
