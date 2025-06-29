'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

function IssueActions() {
  const { data: session } = useSession();
  
  return (
    <div>
      <Button className="mb-1 bg-blue-500 text-white">
        {session ? <Link href="/issues/new">New Issue</Link> : 'Please Login'}
      </Button>
    </div>
  );
}

export default IssueActions;
