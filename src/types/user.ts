export interface User {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    role: number;
    password: string;
    clerkId: string;
}

export type Issue = {
  id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'low' | 'medium' | 'high';
  assignedDate: string;
  deadlineDate: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  assignedToUserId: string;
};

export type UserWithIssues = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: string | null;
  image: string | null;
  role: number;
  password: string;
  clerkId: string;
  issues: Partial<Issue>[];
  assignedIssues: Partial<Issue>[];
};


