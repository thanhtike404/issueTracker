'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button as RadixButton } from "@radix-ui/themes";
import { useSession } from "next-auth/react";
import IssueBadge from "@/components/Status";
import IssueActions from "@/components/issueList/issueActions";
import DeleteIssue from "@/components/DeleteIssue";
import { CalendarIcon, PersonIcon, ClockIcon, ChatBubbleIcon } from "@radix-ui/react-icons";
import { PaginationDemo } from "@/components/issueList/Pagination";
import { SearchInput } from "@/components/issueList/SearchInput";
import FilterIssue from "@/components/issueList/filterIssue";
import DeadlineFilter from "@/components/issueList/DeadlineFilter";
import { useIssues } from "@/hooks/useIssues";

// Define the issue type based on the API response
interface Issue {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignee: string;
  createdAt: string;
  comments: number;
}

// Helper function to determine border color based on status
const getStatusBorderColor = (status: string | undefined): string => {
  switch (status) {
    case "OPEN":
      return "border-l-green-500 dark:border-l-green-400";
    case "IN_PROGRESS":
      return "border-l-yellow-500 dark:border-l-yellow-400";
    case "CLOSED":
      return "border-l-red-500 dark:border-l-red-400";
    default:
      return "border-l-gray-300 dark:border-l-slate-600";
  }
};

// Helper function to clean issue title
const cleanIssueTitle = (title: string): string => {
  return title.replace(/fucking|shitty|mother fucker/gi, '').trim() || "Untitled Issue";
};

export default function IssuesPage() {
  const { data: session } = useSession();
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Use the useIssues hook with current filters
  const { data: issues = [], isLoading, error } = useIssues(
    status === "ALL" ? "" : status,
    search
  );

  // Calculate pagination
  const totalIssues = issues.length;
  const totalPages = Math.ceil(totalIssues / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedIssues = issues.slice(startIndex, endIndex);

  // Handle status filter change
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle search change
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900 dark:text-slate-100">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error loading issues</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900 dark:text-slate-100">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Issue Tracker</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {isLoading ? "Loading..." : `${totalIssues} ${totalIssues === 1 ? "issue" : "issues"} found.`}
            </p>
          </div>
          {session && <IssueActions />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="md:col-span-1">
            <SearchInput onSearchChange={handleSearchChange} />
          </div>
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 justify-start md:justify-end items-center">
            <FilterIssue selectedStatus={status} onStatusChange={handleStatusChange} />
            <DeadlineFilter />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-slate-200 dark:border-slate-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-100">Loading issues...</h3>
        </div>
      )}

      {/* Issues List or Empty State */}
      {!isLoading && paginatedIssues.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-slate-200 dark:border-slate-700">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-slate-800 dark:text-slate-100">No issues found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No issues match your current filters. Try adjusting your search or create a new issue.
          </p>
          {session && (
            <div className="mt-6">
              <RadixButton size="3" highContrast asChild>
                <Link href="/issues/new">Create New Issue</Link>
              </RadixButton>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedIssues.map((issue: Issue) => (
            <div
              key={issue.id}
              className={`bg-white dark:bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg border dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-900/70 transition-all duration-300 border-l-4 ${getStatusBorderColor(issue.status)}`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Main content area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <IssueBadge status={issue.status as "OPEN" | "IN_PROGRESS" | "CLOSED"} />
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tracking-wider">
                        #{issue.id.toString().padStart(4, '0')}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        {issue.priority}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 leading-tight">
                      <Link
                        href={`/issues/${issue.id}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {cleanIssueTitle(issue.title)}
                      </Link>
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {issue.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2" title="Assigned to">
                        <PersonIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>
                          {issue.assignee !== 'Unassigned' ? (
                            <span className="hover:underline cursor-pointer">
                              {issue.assignee}
                            </span>
                          ) : (
                            <span className="italic">Unassigned</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2" title="Creation date">
                        <CalendarIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>{issue.createdAt}</span>
                      </div>

                      <div className="flex items-center gap-2" title="Comments">
                        <ChatBubbleIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>{issue.comments} {issue.comments === 1 ? 'comment' : 'comments'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons area */}
                  {session?.user.role === 2 && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-0 shrink-0">
                      <RadixButton size="2" variant="soft" color="gray" highContrast asChild>
                        <Link href={`/issues/${issue.id}/update`}>Edit</Link>
                      </RadixButton>
                      <DeleteIssue issueId={issue.id} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalIssues > 0 && totalPages > 1 && (
        <div className="mt-10">
          <PaginationDemo
            itemCount={totalIssues}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
