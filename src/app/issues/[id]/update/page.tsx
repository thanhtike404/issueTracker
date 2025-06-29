'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import IssueForm from '../../components/IssueForm';
import { useIssueById } from '@/hooks/useIssues';
interface ApiIssue {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedDate?: string | null;
  deadlineDate?: string | null;
  assignedToUserId?: string | null;
  images?: Array<{
    id: number;
    imageUrl: string;
  }>;
}



function UpdatePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: apiIssue, isLoading, error } = useIssueById(Number(id));
  console.log(apiIssue,'api issue')
 
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-lg">Loading issue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40 items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error loading issue</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (!apiIssue) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40 items-center justify-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Issue not found</h3>
        </div>
      </div>
    );
  }

  // Transform API data to match IssueForm expectations
  const transformedIssue = {
    id: apiIssue.id,
    title: apiIssue.title,
    description: apiIssue.description,
    priority: apiIssue.priority.toLowerCase() as 'low' | 'medium' | 'high',
    status: apiIssue.status as 'OPEN' | 'IN_PROGRESS' | 'DONE',
    assignedDate: apiIssue.assignedDate ? new Date(apiIssue.assignedDate) : null,
    deadlineDate: apiIssue.deadlineDate ? new Date(apiIssue.deadlineDate) : null,
    assignedToUserId: apiIssue.assignedToUserId,
    images: apiIssue.issueImages,
    storageType: 'cloudinary' as const,
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="grid gap-4 md:grid-cols-[1fr_150px] lg:grid-cols-3 mt-5 mx-auto lg:gap-8 w-[80%]">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <IssueForm issue={transformedIssue} />
        </div>
      </div>
    </div>
  );
}

export default UpdatePage;
