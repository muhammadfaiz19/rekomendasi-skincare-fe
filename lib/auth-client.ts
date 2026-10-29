import Cookies from 'js-cookie';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Client-side only auth helpers.
 */
export const AuthClient = {
  logout(router: AppRouterInstance) {
    Cookies.remove('access_token');
    router.push('/login');
    // Force refresh to clear states
    router.refresh();
  }
};
