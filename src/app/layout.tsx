import './globals.css';
import type { Metadata } from 'next';

import Navbar from './Navbar';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';

import Provider from '@/providers/provider';
import 'react-toastify/dist/ReactToastify.css';
// 
import { ToastContainer } from 'react-toastify';
import SocketSessionHandler from '@/lib/SocketSessionHandler';

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
    <html>
      {/* <body className={inter.className}> */}
      <body>
        <Provider>
          <Theme appearance="dark">
            <Navbar />
            <ReactQueryDevtools initialIsOpen={false} />
            <ToastContainer />
            <SocketSessionHandler />
            <main className="p-5">{children}</main>
          </Theme>
        </Provider>
      </body>
    </html>
  );
}
