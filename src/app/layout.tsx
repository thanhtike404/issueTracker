import './globals.css';
import type { Metadata } from 'next';

import Navbar from './Navbar';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import '@radix-ui/themes/styles.css';

import Provider from '@/providers/provider';
import 'react-toastify/dist/ReactToastify.css';
// 
import { ToastContainer } from 'react-toastify';
import SocketSessionHandler from '@/lib/SocketSessionHandler';
import RadixThemeWrapper from '@/components/RadixThemeWrapper';

export const metadata: Metadata = {
  title: ' issue tracker',
  description: ' issue tracker',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body>
        <Provider>
          <RadixThemeWrapper>
            <Navbar />
            <ReactQueryDevtools initialIsOpen={false} />
            <ToastContainer />
            <SocketSessionHandler />
            {children}
          </RadixThemeWrapper>
        </Provider>
      </body>
    </html>
  );
}
