// hooks/issues/useIssues.ts
import { getIssueById, getIssues } from '@/services/issueService';

import { useQuery } from '@tanstack/react-query';

export const useIssues = (status: string, search: string) => {
  return useQuery({
    queryKey: ['issues', status, search],
    queryFn: () => getIssues(status, search),
  });
};

export const useIssueById = (id: number) => {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: () => getIssueById(id),
  });
};