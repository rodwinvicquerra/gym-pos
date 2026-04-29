'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MembersPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/members', fetcher);
  const [searchTerm, setSearchTerm] = useState('');

  const members = data?.members || [];
  const filtered = members.filter(
    (m: any) =>
      m.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm)
  );

  if (error) return <div>Failed to load members</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground mt-2">
            Total Members: {members.length}
          </p>
        </div>
        <Link href="/members/new">
          <Button>Add Member</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div>Loading members...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No members found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Phone</th>
                    <th className="text-left py-2 px-2">Membership</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member: any) => (
                    <tr key={member.id} className="border-b hover:bg-accent">
                      <td className="py-2 px-2 font-medium">
                        {member.first_name} {member.last_name}
                      </td>
                      <td className="py-2 px-2">{member.email}</td>
                      <td className="py-2 px-2">{member.phone}</td>
                      <td className="py-2 px-2 capitalize">
                        {member.membership_type}
                        {member.membership_end_date && (
                          <div className="text-xs text-muted-foreground">
                            Until{' '}
                            {new Date(
                              member.membership_end_date
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            member.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <Link href={`/members/${member.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
