'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterIssueProps {
  selectedStatus: string;
  onStatusChange?: (status: string) => void;
}

const FilterComponent = ({ selectedStatus, onStatusChange }: FilterIssueProps) => {
  const handleChange = (value: string) => {
    onStatusChange?.(value);
  };

  return (
    <Select value={selectedStatus} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px] mb-1 bg-blue-500 text-white">
        <SelectValue placeholder="Filter by Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All</SelectItem>
        <SelectItem value="OPEN">Open</SelectItem>
        <SelectItem value="CLOSED">Closed</SelectItem>
        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default FilterComponent;
