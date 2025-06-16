'use client'
import React from 'react'
import IssueChart from './IssueChart'
import { useConnectedUserStore } from '@/stores/socketIo/connectedUsers'

function page() {
  const { connectedUserIds } = useConnectedUserStore();

  return (
    <div>
      <IssueChart />
    </div>
  )
}

export default page