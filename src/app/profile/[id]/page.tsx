'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useProfile } from '@/hooks/useProfile';
import { Issue } from '@/types/user';

export default function UserProfile({ params }: { params: { id: string } }) {
  const { data: user, isLoading, isError } = useProfile(params.id);
  const [error, setError] = useState(false);

  // If the profile API fails
  if (error || isError) {
    notFound();
  }

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading user profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user?.image || '/placeholder-user.jpg'} />
              <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.name}</CardTitle>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-4">Created Issues</h2>
              <IssueTable issues={user?.issues || []} />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Assigned Issues</h2>
              <IssueTable issues={user?.assignedIssues || []} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IssueTable({ issues }: { issues: Partial<Issue>[] }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No issues found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {issues.map((issue) => (
          <TableRow key={issue.id}>
            <TableCell>{issue.title}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                issue.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                issue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                issue.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {issue.status}
              </span>
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {issue.priority}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
