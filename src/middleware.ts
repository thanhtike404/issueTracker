export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/devs', '/notifications', '/chat'],
};