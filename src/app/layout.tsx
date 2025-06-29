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
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });


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
      <body className={inter.className}>

        <Provider>
          {/* <Theme appearance="dark"> */}
            <Navbar />
            <ReactQueryDevtools initialIsOpen={false} />
            <ToastContainer />
            <SocketSessionHandler />
            <div >{children}</div>
          {/* </Theme> */}
        </Provider>
      </body>
    </html>
  );
}
