'use client';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  onSearchChange?: (search: string) => void;
}

export function SearchInput({ onSearchChange }: SearchInputProps) {
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    onSearchChange?.(searchValue);
  };

  return (
    <Input
      type="text"
      placeholder="Search"
      onChange={onChangeHandler}
    />
  );
}
