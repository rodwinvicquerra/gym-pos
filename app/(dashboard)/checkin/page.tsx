'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CheckInPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);

  const { data: membersData } = useSWR('/api/members', fetcher);
  const { data: checkinData, mutate: mutateCheckins } = useSWR(
    '/api/checkins',
    fetcher,
    { refreshInterval: 5000 }
  );

  const members = membersData?.members || [];

  useEffect(() => {
    if (checkinData?.checkins) {
      setRecentCheckins(checkinData.checkins.slice(0, 10));
    }
  }, [checkinData]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = members.filter(
        (m: any) =>
          m.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.phone.includes(searchTerm)
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, members]);

  const handleCheckIn = async (memberId: string, memberName: string) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: memberId,
          action: 'check_in',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check in');
      }

      setMessage(`✓ ${memberName} checked in successfully!`);
      setSearchTerm('');
      mutateCheckins();

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

  const handleCheckOut = async (checkinId: string) => {
    setLoading(true);

    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: checkinId,
          action: 'check_out',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check out');
      }

      mutateCheckins();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const activeCheckins = recentCheckins.filter((c: any) => !c.check_out_time);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Member Check-in</h1>
        <p className="text-muted-foreground mt-2">
          Search and check in members quickly
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Check-in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Search member by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-lg p-3"
              disabled={loading}
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-card border rounded-md mt-2 z-10">
                {suggestions.map((member: any) => (
                  <button
                    key={member.id}
                    onClick={() =>
                      handleCheckIn(
                        member.id,
                        `${member.first_name} ${member.last_name}`
                      )
                    }
                    disabled={loading}
                    className="w-full text-left px-4 py-3 hover:bg-accent border-b last:border-b-0 transition"
                  >
                    <div className="font-medium">
                      {member.first_name} {member.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.email} • {member.phone}
                    </div>
                  </button>
                ))}
              </div>
            )}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Check-ins ({activeCheckins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activeCheckins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active check-ins
            </div>
          ) : (
            <div className="space-y-2">
              {activeCheckins.map((checkin: any) => (
                <div
                  key={checkin.id}
                  className="flex justify-between items-center p-3 bg-accent rounded-md"
                >
                  <div>
                    <div className="font-medium">{checkin.first_name} {checkin.last_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Checked in:{' '}
                      {new Date(checkin.check_in_time).toLocaleTimeString()}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCheckOut(checkin.id)}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    Check Out
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {recentCheckins.slice(0, 5).map((checkin: any) => (
              <div key={checkin.id} className="flex justify-between py-2 border-b">
                <span className="font-medium">{checkin.first_name} {checkin.last_name}</span>
                <span className="text-muted-foreground">
                  {new Date(checkin.check_in_time).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
