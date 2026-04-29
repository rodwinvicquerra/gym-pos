'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TransactionsPage() {
  const [formData, setFormData] = useState({
    member_id: '',
    type: 'membership',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: membersData } = useSWR('/api/members', fetcher);
  const { data: transactionsData, mutate } = useSWR('/api/transactions', fetcher, {
    refreshInterval: 5000,
  });

  const members = membersData?.members || [];
  const transactions = transactionsData?.transactions || [];
  const staffId = 'system';

  const handleMemberSearch = (term: string) => {
    if (term.trim()) {
      const filtered = members.filter(
        (m: any) =>
          m.first_name.toLowerCase().includes(term.toLowerCase()) ||
          m.last_name.toLowerCase().includes(term.toLowerCase()) ||
          m.email.toLowerCase().includes(term.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'member_id') {
      handleMemberSearch(value);
    }
  };

  const handleSelectMember = (memberId: string, memberName: string) => {
    setFormData((prev) => ({
      ...prev,
      member_id: memberId,
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          staff_id: staffId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      setFormData({
        member_id: '',
        type: 'membership',
        amount: '',
        description: '',
      });
      setMessage('✓ Transaction recorded successfully!');
      mutate();

      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage('Failed to create transaction. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground mt-2">Record new transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium mb-1 text-foreground">
                Member (Optional)
              </label>
              <Input
                type="text"
                value={formData.member_id}
                onChange={(e) => {
                  handleChange(e);
                  handleMemberSearch(e.target.value);
                }}
                placeholder="Search for member..."
                disabled={loading}
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-card border rounded-md mt-2 z-10">
                  {suggestions.map((member: any) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() =>
                        handleSelectMember(
                          member.id,
                          `${member.first_name} ${member.last_name}`
                        )
                      }
                      className="w-full text-left px-4 py-3 hover:bg-accent border-b last:border-b-0 transition"
                    >
                      <div className="font-medium">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.email}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Transaction Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                >
                  <option value="membership">Membership</option>
                  <option value="walk_in">Walk-in</option>
                  <option value="product">Product</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Amount (₱) *
                </label>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Description
              </label>
              <Input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description"
                disabled={loading}
              />
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
              {loading ? 'Recording...' : 'Record Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>

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
                  <th className="text-left py-2 px-2">Description</th>
                  <th className="text-left py-2 px-2">Amount</th>
                  <th className="text-left py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((transaction: any) => (
                  <tr key={transaction.id} className="border-b hover:bg-accent">
                    <td className="py-2 px-2 text-xs">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2">
                      {transaction.first_name
                        ? `${transaction.first_name} ${transaction.last_name}`
                        : 'Walk-in'}
                    </td>
                    <td className="py-2 px-2 capitalize">{transaction.type}</td>
                    <td className="py-2 px-2">{transaction.description || '-'}</td>
                    <td className="py-2 px-2 font-semibold">
                      ₱{parseFloat(transaction.amount).toFixed(2)}
                    </td>
                    <td className="py-2 px-2">
                      <Button
                        onClick={() =>
                          window.open(
                            `/api/receipt?transaction_id=${transaction.id}&format=html`,
                            '_blank'
                          )
                        }
                        size="sm"
                        variant="outline"
                      >
                        Receipt
                      </Button>
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
