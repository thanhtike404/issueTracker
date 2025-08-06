'use client';

import { Theme } from '@radix-ui/themes';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function RadixThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a default theme during SSR to prevent hydration mismatch
    return (
      <Theme appearance="light">
        {children}
      </Theme>
    );
  }

  // Map next-themes values to Radix UI theme values
  const radixTheme = theme === 'dark' ? 'dark' : 'light';

  return (
    <Theme appearance={radixTheme}>
      {children}
    </Theme>
  );
}